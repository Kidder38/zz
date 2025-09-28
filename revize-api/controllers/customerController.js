const db = require('../db');

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    // Získat zákazníky s IČ a DIČ
    const customersResult = await db.query(`
      SELECT * FROM customers ORDER BY company_name
    `);
    
    // Pro každého zákazníka získat kontaktní osoby
    const customers = await Promise.all(
      customersResult.rows.map(async (customer) => {
        const contactPersonsResult = await db.query(`
          SELECT id, name, email, phone 
          FROM contact_persons 
          WHERE customer_id = $1
        `, [customer.id]);
        
        // Přidat kontaktní osoby k zákazníkovi
        return {
          ...customer,
          contact_persons: contactPersonsResult.rows.length > 0 ? contactPersonsResult.rows : undefined
        };
      })
    );
    
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerResult = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Získat kontaktní osoby zákazníka
    const contactPersonsResult = await db.query(`
      SELECT id, name, email, phone 
      FROM contact_persons 
      WHERE customer_id = $1
    `, [id]);
    
    // Přidat kontaktní osoby k objektu zákazníka
    const customer = {
      ...customerResult.rows[0],
      contact_persons: contactPersonsResult.rows.length > 0 ? contactPersonsResult.rows : undefined
    };
    
    res.status(200).json(customer);
  } catch (error) {
    console.error(`Error getting customer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const {
      company_name,
      ico,
      dic,
      street,
      city,
      postal_code,
      contact_persons,
    } = req.body;

    // Validate required fields
    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Začít transakci
    await db.query('BEGIN');

    // Vložit zákazníka
    const customerResult = await db.query(
      `INSERT INTO customers (
        company_name, ico, dic, street, city, postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [company_name, ico, dic, street, city, postal_code]
    );

    const newCustomer = customerResult.rows[0];

    // Zpracovat kontaktní osoby, pokud existují
    if (contact_persons && contact_persons.length > 0) {
      for (const person of contact_persons) {
        await db.query(
          `INSERT INTO contact_persons (
            customer_id, name, email, phone
          ) VALUES ($1, $2, $3, $4)`,
          [newCustomer.id, person.name, person.email, person.phone]
        );
      }
    }

    // Zpracovat starou strukturu kontaktní osoby pro zpětnou kompatibilitu
    if (req.body.contact_person) {
      await db.query(
        `UPDATE customers SET
          contact_person = $1,
          email = $2,
          phone = $3
        WHERE id = $4`,
        [req.body.contact_person, req.body.email, req.body.phone, newCustomer.id]
      );
    }

    // Commit transakce
    await db.query('COMMIT');

    // Získat kontaktní osoby pro odpověď
    const contactPersonsResult = await db.query(
      `SELECT id, name, email, phone FROM contact_persons WHERE customer_id = $1`,
      [newCustomer.id]
    );

    // Vytvořit objekt zákazníka s kontaktními osobami
    const customerWithContacts = {
      ...newCustomer,
      contact_persons: contactPersonsResult.rows.length > 0 ? contactPersonsResult.rows : undefined
    };

    res.status(201).json(customerWithContacts);
  } catch (error) {
    // Rollback v případě chyby
    await db.query('ROLLBACK');
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      ico,
      dic,
      street,
      city,
      postal_code,
      contact_persons,
    } = req.body;

    // Validate required fields
    if (!company_name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Zjistit, zda zákazník existuje
    const checkResult = await db.query('SELECT id FROM customers WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Začít transakci
    await db.query('BEGIN');

    // Aktualizovat zákazníka
    const result = await db.query(
      `UPDATE customers SET 
        company_name = $1, 
        ico = $2, 
        dic = $3, 
        street = $4, 
        city = $5, 
        postal_code = $6
      WHERE id = $7 RETURNING *`,
      [company_name, ico, dic, street, city, postal_code, id]
    );

    // Zpracovat starou strukturu kontaktní osoby pro zpětnou kompatibilitu
    if (req.body.contact_person !== undefined) {
      await db.query(
        `UPDATE customers SET
          contact_person = $1,
          email = $2,
          phone = $3
        WHERE id = $4`,
        [req.body.contact_person, req.body.email, req.body.phone, id]
      );
    }

    // Zpracovat kontaktní osoby
    if (contact_persons && contact_persons.length > 0) {
      // Nejprve smazat stávající kontaktní osoby
      await db.query('DELETE FROM contact_persons WHERE customer_id = $1', [id]);
      
      // Potom vložit nové kontaktní osoby
      for (const person of contact_persons) {
        await db.query(
          `INSERT INTO contact_persons (
            customer_id, name, email, phone
          ) VALUES ($1, $2, $3, $4)`,
          [id, person.name, person.email, person.phone]
        );
      }
    }

    // Commit transakce
    await db.query('COMMIT');

    // Získat kontaktní osoby pro odpověď
    const contactPersonsResult = await db.query(
      `SELECT id, name, email, phone FROM contact_persons WHERE customer_id = $1`,
      [id]
    );

    // Vytvořit objekt zákazníka s kontaktními osobami
    const customerWithContacts = {
      ...result.rows[0],
      contact_persons: contactPersonsResult.rows.length > 0 ? contactPersonsResult.rows : undefined
    };

    res.status(200).json(customerWithContacts);
  } catch (error) {
    // Rollback v případě chyby
    await db.query('ROLLBACK');
    console.error(`Error updating customer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const checkResult = await db.query('SELECT id FROM customers WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    await db.query('DELETE FROM customers WHERE id = $1', [id]);
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(`Error deleting customer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer's equipment
exports.getCustomerEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const customerResult = await db.query('SELECT id FROM customers WHERE id = $1', [id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const result = await db.query(
      `SELECT * FROM equipment WHERE customer_id = $1 ORDER BY equipment_type, model`,
      [id]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`Error getting equipment for customer ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
