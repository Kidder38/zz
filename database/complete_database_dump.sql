--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_modified_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_projects_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_projects_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: checklist_template_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_template_items (
    id integer NOT NULL,
    template_id integer,
    item_text character varying(255) NOT NULL,
    category character varying(50) NOT NULL,
    order_index integer NOT NULL,
    required boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE checklist_template_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.checklist_template_items IS 'Items in checklist templates';


--
-- Name: checklist_template_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checklist_template_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checklist_template_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checklist_template_items_id_seq OWNED BY public.checklist_template_items.id;


--
-- Name: checklist_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_templates (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    equipment_type character varying(50),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE checklist_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.checklist_templates IS 'Predefined inspection checklists';


--
-- Name: checklist_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checklist_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checklist_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checklist_templates_id_seq OWNED BY public.checklist_templates.id;


--
-- Name: contact_persons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_persons (
    id integer NOT NULL,
    customer_id integer,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: contact_persons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_persons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_persons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_persons_id_seq OWNED BY public.contact_persons.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    street character varying(255),
    city character varying(255),
    postal_code character varying(20),
    contact_person character varying(255),
    email character varying(255),
    phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ico character varying(8),
    dic character varying(12)
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: daily_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_checks (
    id integer NOT NULL,
    logbook_entry_id integer,
    check_category character varying(50) NOT NULL,
    check_item character varying(100) NOT NULL,
    check_result character varying(20) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT daily_checks_check_result_check CHECK (((check_result)::text = ANY ((ARRAY['ok'::character varying, 'defect'::character varying, 'not_applicable'::character varying, 'not_checked'::character varying])::text[])))
);


--
-- Name: TABLE daily_checks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.daily_checks IS 'Daily inspection checklist results';


--
-- Name: daily_checks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_checks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_checks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_checks_id_seq OWNED BY public.daily_checks.id;


--
-- Name: defects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.defects (
    id integer NOT NULL,
    revision_id integer,
    section character varying(50) NOT NULL,
    item_key character varying(100) NOT NULL,
    item_name character varying(255),
    description text NOT NULL,
    severity character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: defects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.defects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: defects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.defects_id_seq OWNED BY public.defects.id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    customer_id integer,
    equipment_type character varying(100) NOT NULL,
    model character varying(100),
    manufacturer character varying(100),
    year_of_manufacture integer,
    serial_number character varying(100),
    inventory_number character varying(100),
    max_load numeric,
    classification character varying(100),
    last_revision_date date,
    next_revision_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(100),
    equipment_class character varying(100)
);


--
-- Name: COLUMN equipment.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.equipment.category IS 'Equipment category according to § 3 NV 193/2022 Sb.';


--
-- Name: COLUMN equipment.equipment_class; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.equipment.equipment_class IS 'Equipment class according to § 4 NV 193/2022 Sb.';


--
-- Name: equipment_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_configurations (
    id integer NOT NULL,
    equipment_id integer,
    min_reach numeric,
    max_reach numeric,
    lift_height numeric,
    description character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: equipment_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipment_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipment_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipment_configurations_id_seq OWNED BY public.equipment_configurations.id;


--
-- Name: equipment_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_files (
    id integer NOT NULL,
    equipment_id integer,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer,
    content_type character varying(100),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: equipment_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipment_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipment_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipment_files_id_seq OWNED BY public.equipment_files.id;


--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: equipment_operators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipment_operators (
    id integer NOT NULL,
    equipment_id integer,
    operator_id integer,
    assigned_date date DEFAULT CURRENT_DATE,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE equipment_operators; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.equipment_operators IS 'Assignment of operators to equipment';


--
-- Name: equipment_operators_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipment_operators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: equipment_operators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipment_operators_id_seq OWNED BY public.equipment_operators.id;


--
-- Name: fault_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fault_reports (
    id integer NOT NULL,
    logbook_entry_id integer,
    equipment_id integer,
    operator_id integer,
    fault_type character varying(50) NOT NULL,
    severity character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    immediate_action text,
    equipment_stopped boolean DEFAULT false,
    resolved boolean DEFAULT false,
    resolved_date timestamp without time zone,
    resolved_by character varying(255),
    resolution_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fault_reports_fault_type_check CHECK (((fault_type)::text = ANY ((ARRAY['mechanical'::character varying, 'electrical'::character varying, 'safety'::character varying, 'structural'::character varying, 'operational'::character varying])::text[]))),
    CONSTRAINT fault_reports_severity_check CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[])))
);


--
-- Name: TABLE fault_reports; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.fault_reports IS 'Fault and defect reports';


--
-- Name: fault_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fault_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fault_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fault_reports_id_seq OWNED BY public.fault_reports.id;


--
-- Name: inspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspections (
    id integer NOT NULL,
    equipment_id integer,
    inspector_name character varying(255) NOT NULL,
    inspection_date date NOT NULL,
    inspection_type character varying(100),
    findings text,
    recommendations text,
    next_inspection_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inspections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inspections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inspections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inspections_id_seq OWNED BY public.inspections.id;


--
-- Name: logbook_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logbook_entries (
    id integer NOT NULL,
    equipment_id integer,
    operator_id integer,
    entry_date date DEFAULT CURRENT_DATE NOT NULL,
    entry_time time without time zone DEFAULT CURRENT_TIME NOT NULL,
    entry_type character varying(50) NOT NULL,
    shift character varying(20),
    operating_hours numeric(6,1),
    weather_conditions character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT logbook_entries_entry_type_check CHECK (((entry_type)::text = ANY ((ARRAY['daily_check'::character varying, 'operation'::character varying, 'maintenance'::character varying, 'fault_report'::character varying, 'incident'::character varying])::text[])))
);


--
-- Name: TABLE logbook_entries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.logbook_entries IS 'Main logbook entries according to ČSN EN 12480-1';


--
-- Name: logbook_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.logbook_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logbook_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.logbook_entries_id_seq OWNED BY public.logbook_entries.id;


--
-- Name: operation_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operation_records (
    id integer NOT NULL,
    logbook_entry_id integer,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    load_description character varying(255),
    max_load_used numeric(8,2),
    cycles_count integer,
    unusual_loads boolean DEFAULT false,
    unusual_loads_description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE operation_records; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.operation_records IS 'Detailed operation records';


--
-- Name: operation_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.operation_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: operation_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.operation_records_id_seq OWNED BY public.operation_records.id;


--
-- Name: operators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operators (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    operator_card_number character varying(50),
    certification_valid_until date,
    phone character varying(20),
    email character varying(255),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE operators; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.operators IS 'Equipment operators with certifications';


--
-- Name: operators_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.operators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: operators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.operators_id_seq OWNED BY public.operators.id;


--
-- Name: project_equipment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_equipment (
    id integer NOT NULL,
    project_id integer NOT NULL,
    equipment_id integer NOT NULL,
    assigned_date date NOT NULL,
    planned_removal_date date,
    actual_removal_date date,
    operator_id integer,
    operating_hours_start numeric(10,2),
    operating_hours_end numeric(10,2),
    notes text,
    removal_reason character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    CONSTRAINT check_removal_date CHECK (((actual_removal_date IS NULL) OR (actual_removal_date >= assigned_date)))
);


--
-- Name: TABLE project_equipment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_equipment IS 'Přiřazení jeřábů ke stavbám s časovou historií';


--
-- Name: COLUMN project_equipment.actual_removal_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.project_equipment.actual_removal_date IS 'NULL = jeřáb je stále přiřazen, datum = byl odebrán';


--
-- Name: COLUMN project_equipment.removal_reason; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.project_equipment.removal_reason IS 'Důvod odebrání jeřábu ze stavby';


--
-- Name: project_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_equipment_id_seq OWNED BY public.project_equipment.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    project_number character varying(100),
    client character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'planned'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    address text NOT NULL,
    gps_latitude numeric(10,8),
    gps_longitude numeric(11,8),
    start_date date NOT NULL,
    planned_end_date date,
    actual_end_date date,
    project_manager character varying(255) NOT NULL,
    site_manager character varying(255),
    client_contact character varying(255),
    client_phone character varying(50),
    description text,
    special_requirements text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_by integer,
    CONSTRAINT check_project_dates CHECK (((actual_end_date IS NULL) OR (actual_end_date >= start_date))),
    CONSTRAINT projects_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
    CONSTRAINT projects_status_check CHECK (((status)::text = ANY ((ARRAY['planned'::character varying, 'active'::character varying, 'on_hold'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.projects IS 'Tabulka pro stavby/projekty - hlavní entita pro přiřazování jeřábů';


--
-- Name: COLUMN projects.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.status IS 'Stav projektu: planned, active, on_hold, completed, cancelled';


--
-- Name: COLUMN projects.priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.projects.priority IS 'Priorita projektu: low, medium, high, urgent';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revisions (
    id integer NOT NULL,
    equipment_id integer,
    technician_name character varying(255) NOT NULL,
    certification_number character varying(100),
    revision_date date NOT NULL,
    start_date date,
    evaluation character varying(100) NOT NULL,
    next_revision_date date,
    next_inspection_date date,
    documentation_check jsonb,
    equipment_check jsonb,
    functional_test jsonb,
    load_test jsonb,
    conclusion text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    location character varying(255),
    revision_number character varying(255),
    measuring_instruments jsonb,
    technical_assessment jsonb,
    defects jsonb,
    dangers jsonb,
    previous_controls_ok boolean DEFAULT true,
    technical_trend text,
    procedure_type character varying(50) DEFAULT 'ZKOUŠKA'::character varying,
    configuration_id integer,
    test_start_date date,
    test_end_date date,
    report_date date,
    handover_date date,
    category character varying(10),
    equipment_class character varying(10),
    equipment_type character varying(255),
    model character varying(255)
);


--
-- Name: COLUMN revisions.location; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.location IS 'Location where revision was performed';


--
-- Name: COLUMN revisions.revision_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.revision_number IS 'Revision protocol number';


--
-- Name: COLUMN revisions.measuring_instruments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.measuring_instruments IS 'JSON array of measuring instruments used';


--
-- Name: COLUMN revisions.technical_assessment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.technical_assessment IS 'JSON object with technical assessment details';


--
-- Name: COLUMN revisions.defects; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.defects IS 'JSON array of defects found';


--
-- Name: COLUMN revisions.dangers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.dangers IS 'JSON array of dangers identified';


--
-- Name: COLUMN revisions.previous_controls_ok; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.previous_controls_ok IS 'Whether previous controls were satisfactory';


--
-- Name: COLUMN revisions.technical_trend; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.technical_trend IS 'Technical trend assessment';


--
-- Name: COLUMN revisions.procedure_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.procedure_type IS 'Type of procedure according to § 8 NV 193/2022 Sb.';


--
-- Name: COLUMN revisions.configuration_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.configuration_id IS 'Reference to equipment configuration used during revision';


--
-- Name: COLUMN revisions.test_start_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.test_start_date IS 'Date when testing/inspection started (§ 9 písm. e)';


--
-- Name: COLUMN revisions.test_end_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.test_end_date IS 'Date when testing/inspection ended (§ 9 písm. e)';


--
-- Name: COLUMN revisions.report_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.report_date IS 'Date when revision report was prepared (§ 9 písm. e)';


--
-- Name: COLUMN revisions.handover_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.revisions.handover_date IS 'Date when revision report was handed over (§ 9 písm. e)';


--
-- Name: revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.revisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.revisions_id_seq OWNED BY public.revisions.id;


--
-- Name: service_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_visits (
    id integer NOT NULL,
    equipment_id integer,
    technician_name character varying(255) NOT NULL,
    visit_date date NOT NULL,
    hours_worked numeric,
    description text,
    parts_used text,
    cost numeric,
    invoiced boolean DEFAULT false,
    invoice_number character varying(100),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: service_visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_visits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_visits_id_seq OWNED BY public.service_visits.id;


--
-- Name: user_equipment_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_equipment_assignments (
    id integer NOT NULL,
    user_id integer,
    equipment_id integer,
    assigned_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_equipment_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_equipment_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_equipment_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_equipment_assignments_id_seq OWNED BY public.user_equipment_assignments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(255),
    phone character varying(20),
    role character varying(50) DEFAULT 'operator'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    is_operator boolean DEFAULT false,
    operator_card_number character varying(50),
    certification_valid_until date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: checklist_template_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_template_items ALTER COLUMN id SET DEFAULT nextval('public.checklist_template_items_id_seq'::regclass);


--
-- Name: checklist_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_templates ALTER COLUMN id SET DEFAULT nextval('public.checklist_templates_id_seq'::regclass);


--
-- Name: contact_persons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_persons ALTER COLUMN id SET DEFAULT nextval('public.contact_persons_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: daily_checks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_checks ALTER COLUMN id SET DEFAULT nextval('public.daily_checks_id_seq'::regclass);


--
-- Name: defects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.defects ALTER COLUMN id SET DEFAULT nextval('public.defects_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: equipment_configurations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_configurations ALTER COLUMN id SET DEFAULT nextval('public.equipment_configurations_id_seq'::regclass);


--
-- Name: equipment_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_files ALTER COLUMN id SET DEFAULT nextval('public.equipment_files_id_seq'::regclass);


--
-- Name: equipment_operators id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_operators ALTER COLUMN id SET DEFAULT nextval('public.equipment_operators_id_seq'::regclass);


--
-- Name: fault_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_reports ALTER COLUMN id SET DEFAULT nextval('public.fault_reports_id_seq'::regclass);


--
-- Name: inspections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections ALTER COLUMN id SET DEFAULT nextval('public.inspections_id_seq'::regclass);


--
-- Name: logbook_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logbook_entries ALTER COLUMN id SET DEFAULT nextval('public.logbook_entries_id_seq'::regclass);


--
-- Name: operation_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operation_records ALTER COLUMN id SET DEFAULT nextval('public.operation_records_id_seq'::regclass);


--
-- Name: operators id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operators ALTER COLUMN id SET DEFAULT nextval('public.operators_id_seq'::regclass);


--
-- Name: project_equipment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_equipment ALTER COLUMN id SET DEFAULT nextval('public.project_equipment_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: revisions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisions ALTER COLUMN id SET DEFAULT nextval('public.revisions_id_seq'::regclass);


--
-- Name: service_visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_visits ALTER COLUMN id SET DEFAULT nextval('public.service_visits_id_seq'::regclass);


--
-- Name: user_equipment_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_equipment_assignments ALTER COLUMN id SET DEFAULT nextval('public.user_equipment_assignments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: checklist_template_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_template_items (id, template_id, item_text, category, order_index, required, created_at) FROM stdin;
1	1	Vizuální kontrola nosné konstrukce (praskliny, deformace)	visual	1	t	2025-08-21 19:34:28.206013
2	1	Kontrola svarů a spojů	visual	2	t	2025-08-21 19:34:28.206013
3	1	Stav lan a řetězů	visual	3	t	2025-08-21 19:34:28.206013
4	1	Kontrola háků a závěsných prostředků	visual	4	t	2025-08-21 19:34:28.206013
5	1	Stav kolejnic a pojezdů	visual	5	t	2025-08-21 19:34:28.206013
6	1	Funkce všech ovládacích prvků	functional	6	t	2025-08-21 19:34:28.206013
7	1	Funkce brzd a pojistek	functional	7	t	2025-08-21 19:34:28.206013
8	1	Zkouška nouzového zastavení	functional	8	t	2025-08-21 19:34:28.206013
9	1	Funkce koncových spínačů	functional	9	t	2025-08-21 19:34:28.206013
10	1	Funkce signalizace a výstražných zařízení	functional	10	t	2025-08-21 19:34:28.206013
11	1	Funkce omezovače nosnosti	safety	11	t	2025-08-21 19:34:28.206013
12	1	Dostupnost a čitelnost návodu k obsluze	documentation	12	t	2025-08-21 19:34:28.206013
13	1	Provedení zápisů v provozním deníku	documentation	13	t	2025-08-21 19:34:28.206013
14	1	Vizuální kontrola nosné konstrukce (praskliny, deformace)	visual	1	t	2025-08-25 20:55:16.00243
15	1	Kontrola svarů a spojů	visual	2	t	2025-08-25 20:55:16.00243
16	1	Stav lan a řetězů	visual	3	t	2025-08-25 20:55:16.00243
17	1	Kontrola háků a závěsných prostředků	visual	4	t	2025-08-25 20:55:16.00243
18	1	Stav kolejnic a pojezdů	visual	5	t	2025-08-25 20:55:16.00243
19	1	Funkce všech ovládacích prvků	functional	6	t	2025-08-25 20:55:16.00243
20	1	Funkce brzd a pojistek	functional	7	t	2025-08-25 20:55:16.00243
21	1	Zkouška nouzového zastavení	functional	8	t	2025-08-25 20:55:16.00243
22	1	Funkce koncových spínačů	functional	9	t	2025-08-25 20:55:16.00243
23	1	Funkce signalizace a výstražných zařízení	functional	10	t	2025-08-25 20:55:16.00243
24	1	Funkce omezovače nosnosti	safety	11	t	2025-08-25 20:55:16.00243
25	1	Dostupnost a čitelnost návodu k obsluze	documentation	12	t	2025-08-25 20:55:16.00243
26	1	Provedení zápisů v provozním deníku	documentation	13	t	2025-08-25 20:55:16.00243
\.


--
-- Data for Name: checklist_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_templates (id, name, category, equipment_type, active, created_at) FROM stdin;
1	Denní kontrola jeřábu	daily	jerab	t	2025-08-21 19:34:28.205785
2	Denní kontrola jeřábu	daily	jerab	t	2025-08-25 20:55:16.000718
\.


--
-- Data for Name: contact_persons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_persons (id, customer_id, name, email, phone, created_at, updated_at) FROM stdin;
1	1	luk	koncha-60.norky@icloud.com	608213323	2025-04-22 14:17:56.184619	2025-04-22 14:17:56.184619
2	2	Lukáš Holubčák	koncha-60.norky@icloud.com	608213323	2025-04-22 17:47:47.996815	2025-04-22 17:47:47.996815
3	3	Martin Rezek			2025-08-25 07:58:11.503513	2025-08-25 07:58:11.503513
4	4	Petr Farkas	farkas@vdogroup.cz		2025-10-01 06:46:34.630136	2025-10-01 06:46:34.630136
5	5	Petr Patka			2025-10-10 07:46:20.007404	2025-10-10 07:46:20.007404
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, company_name, street, city, postal_code, contact_person, email, phone, created_at, updated_at, ico, dic) FROM stdin;
1	test	Pardubická 160	Holice	53401	luk	koncha-60.norky@icloud.com	608213323	2025-04-13 20:41:07.563757	2025-04-13 20:41:07.563757	\N	\N
2	test	Pardubická 160	Holice	53401	\N	\N	\N	2025-04-22 17:47:47.996815	2025-04-22 17:47:47.996815	12345678	CZ12345678
3	Martin Rezek	Nahořanská 311	Nobé Město nad Metují	54901	\N	\N	\N	2025-08-25 07:58:11.503513	2025-08-25 07:58:11.503513	87362830	CZ8303043056
4	V.D.O. Group s.r.o.	Tepelská 137/3	Mariánské Lázně	35301	\N	\N	\N	2025-10-01 06:46:34.630136	2025-10-01 06:46:34.630136	26380706	CZ26380706
5	Betonservis s.r.o.	Borovnice 107	Borovnice	54477	\N	\N	\N	2025-10-10 07:46:20.007404	2025-10-10 07:46:20.007404	27090523	CZ27090523
\.


--
-- Data for Name: daily_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_checks (id, logbook_entry_id, check_category, check_item, check_result, notes, created_at) FROM stdin;
1	5	visual	Nosná konstrukce	ok	Bez viditelných závad	2025-08-25 21:00:29.880542
2	5	functional	Funkce brzd	ok	Brzdy fungují správně	2025-08-25 21:00:29.880542
\.


--
-- Data for Name: defects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.defects (id, revision_id, section, item_key, item_name, description, severity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment (id, customer_id, equipment_type, model, manufacturer, year_of_manufacture, serial_number, inventory_number, max_load, classification, last_revision_date, next_revision_date, created_at, updated_at, category, equipment_class) FROM stdin;
6	3	věžový jeřáb	CTT121A-5-TS16	Terex Comedil	2006	G9006030		5000		2025-09-16	2027-09-16	2025-09-10 09:58:06.223193	2025-09-16 07:15:57.033799	a	I
7	3	rychlostavitelný jeřáb	OMV15R	Edilgru	2024	6987		1500		2025-09-16	2027-09-16	2025-09-16 07:39:54.003137	2025-09-16 07:42:33.001749	a	I
8	4	věžový jeřáb	CTT161	Terex - Comedil	2008	G7608056		8000		2025-09-27	2027-09-27	2025-10-01 06:48:39.520163	2025-10-01 06:54:33.589019	a	I
9	3	samostavitelný jeřáb	FB GRU GA138	FB F.lli Butti s.r.l.	2019	D121	0217	4000		2025-10-01	2027-10-01	2025-10-01 07:09:43.569201	2025-10-01 07:11:14.261055	a	I
10	3	věžový jeřáb	GHS160	FB GRU	2006	2503	0705	6000		2025-10-07	2027-10-01	2025-10-07 19:43:28.432304	2025-10-07 19:48:26.43427	a	I
11	4	věžový jeřáb	CTT231-10	Terex Comedil	2007	G9807008		100000		2025-10-07	2027-10-07	2025-10-10 07:29:50.051483	2025-10-10 07:33:48.750492	a	I
12	5	samostavitelný jeřáb	MH Turbo28	Edilgru s.pa.	2009	6584A		2000		2025-10-10	2027-10-10	2025-10-10 07:49:44.24697	2025-10-10 07:51:18.78484	a	II
13	4	věžový jeřáb	CTT161/A-8	GRU COMEDIL S.R.L.	2006	G7606046		8000		2025-10-10	2027-10-10	2025-11-03 06:55:09.026094	2025-11-03 06:59:12.548901	a	I
14	4	věžový jeřáb	GHS 160	FB GRU	2006	11711	1304	6000		2025-11-03	2027-11-03	2025-11-03 07:03:24.971913	2025-11-03 07:08:10.072298	a	I
\.


--
-- Data for Name: equipment_configurations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment_configurations (id, equipment_id, min_reach, max_reach, lift_height, description, created_at, updated_at) FROM stdin;
5	6	2.1	50	24	Vyložená 50m, Výška 24 m	2025-09-10 09:59:12.715816	2025-09-10 09:59:12.715816
6	7	0.5	14.8	14.4	Standard	2025-09-16 07:41:14.465639	2025-09-16 07:41:14.465639
7	8	2.3	35	39	35 vyložení, 39 m výška	2025-10-01 06:49:40.640824	2025-10-01 06:49:40.640824
8	9	2.4	38	21.5	38 m vyložení, Výška 21,5 m	2025-10-01 07:10:34.557177	2025-10-01 07:10:34.557177
9	10	3.5	60	24	Vyložení 60 m, Výška 24m	2025-10-07 19:44:46.057672	2025-10-07 19:44:46.057672
10	11	0	50	49.6	Výška 49,6, Vyložení 50	2025-10-10 07:32:20.330964	2025-10-10 07:32:20.330964
11	12	0	28	19	Max.	2025-10-10 07:50:27.727392	2025-10-10 07:50:27.727392
12	13	2.3	50	42	Vyložení 50 m, Výška 42 m	2025-11-03 06:56:13.305444	2025-11-03 06:56:13.305444
13	14	3.5	55	30	Výška 30m, Vyložení 55	2025-11-03 07:03:52.632268	2025-11-03 07:03:52.632268
\.


--
-- Data for Name: equipment_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment_files (id, equipment_id, file_name, file_path, file_type, file_size, content_type, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: equipment_operators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment_operators (id, equipment_id, operator_id, assigned_date, active, created_at) FROM stdin;
\.


--
-- Data for Name: fault_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fault_reports (id, logbook_entry_id, equipment_id, operator_id, fault_type, severity, title, description, immediate_action, equipment_stopped, resolved, resolved_date, resolved_by, resolution_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspections (id, equipment_id, inspector_name, inspection_date, inspection_type, findings, recommendations, next_inspection_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: logbook_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logbook_entries (id, equipment_id, operator_id, entry_date, entry_time, entry_type, shift, operating_hours, weather_conditions, notes, created_at, updated_at) FROM stdin;
21	7	2	2025-09-27	19:12:52.316276	operation	day	\N	\N	Kontrola prováděná obsluhou před každým zahájením práce	2025-09-27 19:12:52.316276	2025-09-27 19:12:52.316276
22	7	2	2025-09-27	19:13:23.737085	operation	day	\N	\N	Rozšířená kontrola prováděná obsluhou	2025-09-27 19:13:23.737085	2025-09-27 19:13:23.737085
23	7	2	2025-09-27	19:14:02.151857	operation	day	\N	\N	Rozšířená kontrola prováděná obsluhou	2025-09-27 19:14:02.151857	2025-09-27 19:14:02.151857
24	7	2	2025-09-27	19:14:06.097925	operation	day	\N	\N	Rozšířená kontrola prováděná obsluhou	2025-09-27 19:14:06.097925	2025-09-27 19:14:06.097925
25	7	2	2025-09-27	19:14:11.232815	operation	day	\N	\N	Rozšířená kontrola prováděná obsluhou	2025-09-27 19:14:11.232815	2025-09-27 19:14:11.232815
\.


--
-- Data for Name: operation_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.operation_records (id, logbook_entry_id, start_time, end_time, load_description, max_load_used, cycles_count, unusual_loads, unusual_loads_description, created_at) FROM stdin;
1	4	08:00:00	16:00:00	Prefabrikované panely	3.50	45	\N	\N	2025-08-25 20:58:42.188997
2	8	08:00:00	16:00:00	Kontrolní činnost	0.00	0	\N	\N	2025-08-25 21:19:05.098107
3	14	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-08-26 06:09:41.510826
4	15	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-08-26 06:10:22.494693
5	16	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-08-26 06:10:30.85356
6	17	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-08-26 06:10:58.838348
7	18	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-08 13:31:36.03308
8	19	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-08 13:31:54.402136
9	20	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-08 13:32:49.864046
10	21	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-27 19:12:52.316276
11	22	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-27 19:13:23.737085
12	23	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-27 19:14:02.151857
13	24	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-27 19:14:06.097925
14	25	08:00:00	16:00:00	Kontrolní činnost	0.00	0	f		2025-09-27 19:14:11.232815
\.


--
-- Data for Name: operators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.operators (id, first_name, last_name, operator_card_number, certification_valid_until, phone, email, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_equipment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_equipment (id, project_id, equipment_id, assigned_date, planned_removal_date, actual_removal_date, operator_id, operating_hours_start, operating_hours_end, notes, removal_reason, created_at, updated_at, created_by) FROM stdin;
20	9	6	2025-09-10	\N	\N	\N	\N	\N	\N	\N	2025-09-10 12:56:16.245542	2025-09-10 12:56:16.245542	\N
21	10	8	2025-10-01	2026-03-31	\N	\N	\N	\N	\N	\N	2025-10-01 06:53:53.780023	2025-10-01 06:53:53.780023	\N
22	12	10	2025-10-07	\N	\N	\N	\N	\N	\N	\N	2025-10-07 19:46:15.264578	2025-10-07 19:46:15.264578	\N
23	15	13	2025-11-03	2026-03-31	\N	\N	\N	\N	\N	\N	2025-11-03 06:58:33.629017	2025-11-03 06:58:33.629017	\N
24	16	14	2025-11-03	\N	\N	\N	\N	\N	\N	\N	2025-11-03 07:06:05.135007	2025-11-03 07:06:05.135007	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, name, project_number, client, status, priority, address, gps_latitude, gps_longitude, start_date, planned_end_date, actual_end_date, project_manager, site_manager, client_contact, client_phone, description, special_requirements, created_at, updated_at, created_by, updated_by) FROM stdin;
9	Čáslav - Unistav	PRJ-2025-001	StaviRezek	planned	medium	Prokopa Holého, Čáslav	\N	\N	2025-09-10	2026-03-31	\N	Michal Kohut	\N	\N	\N	\N	\N	2025-09-10 12:56:08.597187	2025-09-10 12:56:08.597187	\N	\N
10	Liberec - 1.Máje	PRJ-2025-002	V.D.O. Group s.r.o.	planned	medium	1.Máje, Liberec	\N	\N	2025-10-01	2026-04-30	\N	Petr Farkas	\N	\N	\N	\N	\N	2025-10-01 06:53:34.67689	2025-10-01 06:53:34.67689	\N	\N
11	Náchod - škola	PRJ-2025-003	Martin Rezek	planned	medium	Kladská 335, 547 01 Náchod	\N	\N	2025-10-01	2026-03-31	\N	Martin Rezek	\N	\N	\N	\N	\N	2025-10-01 07:05:33.793378	2025-10-01 07:05:33.793378	\N	\N
12	Sibiřská, olomouc	PRJ-2025-004	SZF	planned	medium	Sibiřská, Olomouc	\N	\N	2025-10-07	2026-03-31	\N	Řičánek	\N	\N	\N	\N	\N	2025-10-07 19:46:03.171109	2025-10-07 19:46:03.171109	\N	\N
13	VDO - České Budějovice	PRJ-2025-005	V.D.O. Group s.r.o.	planned	medium	Branišovská, české Budějovice	\N	\N	2025-10-09	2026-10-30	\N	Adrian						2025-10-10 07:28:24.147604	2025-10-10 07:33:23.680738	\N	\N
14	Strážné - Betonservis	PRJ-2025-006	Bertonservis	planned	medium	Strážné, 54352 Strážné	\N	\N	2025-10-10	2026-04-30	\N	Petr Patka	\N	\N	\N	\N	\N	2025-10-10 07:48:10.312952	2025-10-10 07:48:10.312952	\N	\N
15	Praha - Roztyly	PRJ-2025-007	V.D.O. Group s.r.o.	planned	medium	Hrudičkova, Praha	\N	\N	2025-11-03	2026-02-22	\N	Petr Matlák	\N	\N	\N	\N	\N	2025-11-03 06:58:14.321782	2025-11-03 06:58:14.321782	\N	\N
16	Karlovy Vary	PRJ-2025-008	V.D.O. Group s.r.o.	planned	medium	Sedlecká, Karlovy Vary	\N	\N	2025-11-03	2026-04-30	\N	Petr Matlák	\N	\N	\N	\N	\N	2025-11-03 07:05:52.928241	2025-11-03 07:05:52.928241	\N	\N
\.


--
-- Data for Name: revisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.revisions (id, equipment_id, technician_name, certification_number, revision_date, start_date, evaluation, next_revision_date, next_inspection_date, documentation_check, equipment_check, functional_test, load_test, conclusion, created_at, updated_at, location, revision_number, measuring_instruments, technical_assessment, defects, dangers, previous_controls_ok, technical_trend, procedure_type, configuration_id, test_start_date, test_end_date, report_date, handover_date, category, equipment_class, equipment_type, model) FROM stdin;
58	11	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-10-07	2025-10-07	VYHOVUJE	2027-10-07	2026-10-07	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-10-10 07:33:48.742631	2025-10-10 07:33:48.742631	VDO - České Budějovice, Branišovská, české Budějovice	RE310638	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	10	2025-10-07	2025-10-07	2025-10-07	2025-10-07	a	I	věžový jeřáb	CTT231-10
59	12	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-10-10	2025-10-10	VYHOVUJE	2027-10-10	2026-10-10	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-10-10 07:51:18.781996	2025-10-10 07:51:18.781996	Strážné - Betonservis, Strážné, 54352 Strážné	RE431078	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	11	2025-10-10	2025-10-10	2025-10-10	2025-10-10	a	II	samostavitelný jeřáb	MH Turbo28
60	13	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-10-10	2025-10-10	VYHOVUJE	2027-10-10	2026-10-10	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-11-03 06:59:12.530326	2025-11-03 06:59:12.530326	Praha - Roztyly, Hrudičkova, Praha	RE489058	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	12	2025-10-10	2025-10-10	2025-10-10	2025-10-10	a	I	věžový jeřáb	CTT161/A-8
61	14	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-11-03	2025-11-03	VYHOVUJE	2027-11-03	2026-11-03	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-11-03 07:08:10.06729	2025-11-03 07:08:10.06729	Karlovy Vary, Sedlecká, Karlovy Vary	RE555536	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	13	2025-11-03	2025-11-03	2025-11-03	2025-11-03	a	I	věžový jeřáb	GHS 160
53	6	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-09-16	2025-09-16	VYHOVUJE	2027-09-16	2026-09-16	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-09-16 07:15:57.032161	2025-09-16 07:15:57.032161	Čáslav - Unistav, Prokopa Holého, Čáslav	RE688588	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	5	2025-09-16	2025-09-16	2025-09-16	2025-09-16	a	I	věžový jeřáb	CTT121A-5-TS16
54	7	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-09-16	2025-09-16	VYHOVUJE	2027-09-16	2026-09-16	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-09-16 07:42:32.997004	2025-09-16 07:42:32.997004	Mobilní	RE631786	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	6	2025-09-16	2025-09-16	2025-09-16	2025-09-16	a	I	rychlostavitelný jeřáb	OMV15R
55	8	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-09-27	2025-09-27	VYHOVUJE	2027-09-27	2026-09-27	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-10-01 06:54:33.577227	2025-10-01 06:54:33.577227	Liberec - 1.Máje, 1.Máje, Liberec	RE262546	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	7	2025-09-27	2025-09-27	2025-09-27	2025-09-27	a	I	věžový jeřáb	CTT161
56	9	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-10-01	2025-10-01	VYHOVUJE	2027-10-01	2026-10-01	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Předložen"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Vyhovuje", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-10-01 07:11:14.254922	2025-10-01 07:11:14.254922	Náchod - škola, Kladská 335, 547 01 Náchod	RE478062	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	8	2025-10-01	2025-10-01	2025-10-01	2025-10-01	a	I	samostavitelný jeřáb	FB GRU GA138
57	10	Lukáš Holubčák	156/23/R, Z-ZZ-a, a1, a2, a3	2025-10-07	2025-10-01	VYHOVUJE	2027-10-01	2026-10-01	{"sbp": "Předložen", "kotveni": "Předložen", "denik_zz": "Předložen", "navod_obsluha": "Předložen", "pruvodka_jerabu": "Předložen", "posledni_inspekce": "Předložen", "vychozi_revize_el": "Předložen", "posledni_revize_el": "Předložen", "posledni_revize_jer": "Předložen", "dokumentace_strojni_el": "Předložen", "prohlidky_ocel_konstrukce": "Není součástí"}	{"oznaceni": "Vyhovuje", "komunikace": "Vyhovuje", "nosne_organy": "Vyhovuje", "zapisy_denik": "Vyhovuje", "udrzba_mazani": "Vyhovuje", "hasici_pristroj": "Není součástí", "navod_dostupnost": "Vyhovuje", "nosna_konstrukce": "Vyhovuje", "ukazatel_vylozeni": "Vyhovuje", "pristupy_stanoviste": "Vyhovuje"}	{"omezovace": "Vyhovuje", "funkce_stop": "Vyhovuje", "dalkove_ovladani": "Vyhovuje", "ovladaci_zarizeni": "Vyhovuje", "pohybove_mechanismy": "Vyhovuje", "technologicka_zarizeni": "Vyhovuje", "zabezpecovaci_zarizeni": "Vyhovuje"}	{"dynamicka_zkouska": "Vyhovuje", "omezovac_nosnosti": "Vyhovuje"}	Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.	2025-10-07 19:48:26.425294	2025-10-07 19:48:26.425294	Sibiřská, olomouc, Sibiřská, Olomouc	RE476447	[{"name": "Posuvné měřidlo analogové", "range": "0-200mm", "purpose": "Měření rozměrů"}, {"name": "Posuvné měřidlo analogové", "range": "0-500mm", "purpose": "Měření rozměrů"}, {"name": "Hloubkoměr analogový", "range": "0-200mm", "purpose": "Měření hloubek"}, {"name": "Ocelový svinovací metr", "range": "5 m", "purpose": "Měření délek"}, {"name": "Laserový měřicí přístroj", "range": "-", "purpose": "Přesné měření"}, {"name": "Jeřábová váha", "range": "-", "purpose": "Zkouška zatížením"}, {"name": "Nářadí a pomůcky", "range": "-", "purpose": "Montáž/demontáž"}]	{"safety": "Všechny funkční, správně seřízené", "structure": "Bez viditelných poškození, koroze nebo deformací", "electrical": "Bez závad, správná funkce", "mechanisms": "Plynulý chod, účinné brzdění", "protection": "Funkční, odpovídají požadavkům", "documentation": "Kompletní, aktuální"}	\N	[]	t	Stabilní, bez zhoršujících se parametrů	ZKOUŠKA	9	2025-10-07	2025-10-07	2025-10-07	2025-10-07				
\.


--
-- Data for Name: service_visits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_visits (id, equipment_id, technician_name, visit_date, hours_worked, description, parts_used, cost, invoiced, invoice_number, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_equipment_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_equipment_assignments (id, user_id, equipment_id, assigned_date, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password_hash, first_name, last_name, email, phone, role, is_active, is_operator, operator_card_number, certification_valid_until, created_at, updated_at) FROM stdin;
2	jan.novák	$2b$10$dummy.hash.for.testing	Jan	Novák	\N	\N	operator	t	t	OP-2024-001	\N	2025-08-23 20:21:25.005914	2025-08-23 20:21:25.005914
3	pepek.zdepa	$2b$10$dummy.hash.for.testing	Pepek	z depa	\N	\N	operator	t	t	\N	2025-12-31	2025-08-23 20:21:25.005914	2025-08-23 20:21:25.005914
1	admin	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	Administrator	System	\N	\N	admin	t	f	\N	\N	2025-08-23 20:21:06.738417	2025-08-23 20:29:26.70511
\.


--
-- Name: checklist_template_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checklist_template_items_id_seq', 26, true);


--
-- Name: checklist_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checklist_templates_id_seq', 2, true);


--
-- Name: contact_persons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_persons_id_seq', 5, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 5, true);


--
-- Name: daily_checks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.daily_checks_id_seq', 2, true);


--
-- Name: defects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.defects_id_seq', 4, true);


--
-- Name: equipment_configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipment_configurations_id_seq', 13, true);


--
-- Name: equipment_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipment_files_id_seq', 3, true);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipment_id_seq', 14, true);


--
-- Name: equipment_operators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipment_operators_id_seq', 1, true);


--
-- Name: fault_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fault_reports_id_seq', 2, true);


--
-- Name: inspections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inspections_id_seq', 1, true);


--
-- Name: logbook_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.logbook_entries_id_seq', 25, true);


--
-- Name: operation_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.operation_records_id_seq', 14, true);


--
-- Name: operators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.operators_id_seq', 1, false);


--
-- Name: project_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_equipment_id_seq', 24, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 16, true);


--
-- Name: revisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.revisions_id_seq', 61, true);


--
-- Name: service_visits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_visits_id_seq', 2, true);


--
-- Name: user_equipment_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_equipment_assignments_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: checklist_template_items checklist_template_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_template_items
    ADD CONSTRAINT checklist_template_items_pkey PRIMARY KEY (id);


--
-- Name: checklist_templates checklist_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_templates
    ADD CONSTRAINT checklist_templates_pkey PRIMARY KEY (id);


--
-- Name: contact_persons contact_persons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_persons
    ADD CONSTRAINT contact_persons_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: daily_checks daily_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_checks
    ADD CONSTRAINT daily_checks_pkey PRIMARY KEY (id);


--
-- Name: defects defects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.defects
    ADD CONSTRAINT defects_pkey PRIMARY KEY (id);


--
-- Name: equipment_configurations equipment_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_configurations
    ADD CONSTRAINT equipment_configurations_pkey PRIMARY KEY (id);


--
-- Name: equipment_files equipment_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_files
    ADD CONSTRAINT equipment_files_pkey PRIMARY KEY (id);


--
-- Name: equipment_operators equipment_operators_equipment_id_operator_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_operators
    ADD CONSTRAINT equipment_operators_equipment_id_operator_id_key UNIQUE (equipment_id, operator_id);


--
-- Name: equipment_operators equipment_operators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_operators
    ADD CONSTRAINT equipment_operators_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: fault_reports fault_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_reports
    ADD CONSTRAINT fault_reports_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: logbook_entries logbook_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logbook_entries
    ADD CONSTRAINT logbook_entries_pkey PRIMARY KEY (id);


--
-- Name: operation_records operation_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operation_records
    ADD CONSTRAINT operation_records_pkey PRIMARY KEY (id);


--
-- Name: operators operators_operator_card_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_operator_card_number_key UNIQUE (operator_card_number);


--
-- Name: operators operators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_pkey PRIMARY KEY (id);


--
-- Name: project_equipment project_equipment_equipment_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_equipment
    ADD CONSTRAINT project_equipment_equipment_id_project_id_key UNIQUE (equipment_id, project_id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: project_equipment project_equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_equipment
    ADD CONSTRAINT project_equipment_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects projects_project_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_number_key UNIQUE (project_number);


--
-- Name: revisions revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisions
    ADD CONSTRAINT revisions_pkey PRIMARY KEY (id);


--
-- Name: service_visits service_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_visits
    ADD CONSTRAINT service_visits_pkey PRIMARY KEY (id);


--
-- Name: user_equipment_assignments user_equipment_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_equipment_assignments
    ADD CONSTRAINT user_equipment_assignments_pkey PRIMARY KEY (id);


--
-- Name: user_equipment_assignments user_equipment_assignments_user_id_equipment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_equipment_assignments
    ADD CONSTRAINT user_equipment_assignments_user_id_equipment_id_key UNIQUE (user_id, equipment_id);


--
-- Name: users users_operator_card_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_operator_card_number_key UNIQUE (operator_card_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_contact_persons_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_persons_customer_id ON public.contact_persons USING btree (customer_id);


--
-- Name: idx_daily_checks_logbook; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_checks_logbook ON public.daily_checks USING btree (logbook_entry_id);


--
-- Name: idx_defects_revision_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_defects_revision_id ON public.defects USING btree (revision_id);


--
-- Name: idx_equipment_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_category ON public.equipment USING btree (category);


--
-- Name: idx_equipment_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_class ON public.equipment USING btree (equipment_class);


--
-- Name: idx_equipment_configurations_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_configurations_equipment_id ON public.equipment_configurations USING btree (equipment_id);


--
-- Name: idx_equipment_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_customer_id ON public.equipment USING btree (customer_id);


--
-- Name: idx_equipment_files_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_files_equipment_id ON public.equipment_files USING btree (equipment_id);


--
-- Name: idx_equipment_next_revision_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_next_revision_date ON public.equipment USING btree (next_revision_date);


--
-- Name: idx_equipment_operators_equipment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_operators_equipment ON public.equipment_operators USING btree (equipment_id);


--
-- Name: idx_equipment_operators_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_equipment_operators_operator ON public.equipment_operators USING btree (operator_id);


--
-- Name: idx_fault_reports_equipment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fault_reports_equipment ON public.fault_reports USING btree (equipment_id);


--
-- Name: idx_fault_reports_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fault_reports_resolved ON public.fault_reports USING btree (resolved);


--
-- Name: idx_fault_reports_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fault_reports_severity ON public.fault_reports USING btree (severity);


--
-- Name: idx_inspections_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inspections_equipment_id ON public.inspections USING btree (equipment_id);


--
-- Name: idx_logbook_entries_equipment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logbook_entries_equipment_date ON public.logbook_entries USING btree (equipment_id, entry_date);


--
-- Name: idx_logbook_entries_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logbook_entries_operator ON public.logbook_entries USING btree (operator_id);


--
-- Name: idx_logbook_entries_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_logbook_entries_type ON public.logbook_entries USING btree (entry_type);


--
-- Name: idx_project_equipment_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_equipment_dates ON public.project_equipment USING btree (assigned_date, actual_removal_date);


--
-- Name: idx_project_equipment_equipment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_equipment_equipment ON public.project_equipment USING btree (equipment_id);


--
-- Name: idx_project_equipment_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_equipment_operator ON public.project_equipment USING btree (operator_id);


--
-- Name: idx_project_equipment_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_equipment_project ON public.project_equipment USING btree (project_id);


--
-- Name: idx_projects_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_client ON public.projects USING btree (client);


--
-- Name: idx_projects_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_created_at ON public.projects USING btree (created_at);


--
-- Name: idx_projects_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_dates ON public.projects USING btree (start_date, planned_end_date);


--
-- Name: idx_projects_start_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_start_date ON public.projects USING btree (start_date);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_revisions_configuration_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revisions_configuration_id ON public.revisions USING btree (configuration_id);


--
-- Name: idx_revisions_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_revisions_equipment_id ON public.revisions USING btree (equipment_id);


--
-- Name: idx_service_visits_equipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_visits_equipment_id ON public.service_visits USING btree (equipment_id);


--
-- Name: project_equipment trigger_project_equipment_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_project_equipment_updated_at BEFORE UPDATE ON public.project_equipment FOR EACH ROW EXECUTE FUNCTION public.update_projects_updated_at();


--
-- Name: projects trigger_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_projects_updated_at();


--
-- Name: contact_persons update_contact_persons_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contact_persons_modtime BEFORE UPDATE ON public.contact_persons FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: customers update_customers_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: defects update_defects_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_defects_modtime BEFORE UPDATE ON public.defects FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: equipment_configurations update_equipment_configurations_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_equipment_configurations_modtime BEFORE UPDATE ON public.equipment_configurations FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: equipment_files update_equipment_files_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_equipment_files_modtime BEFORE UPDATE ON public.equipment_files FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: equipment update_equipment_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_equipment_modtime BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: fault_reports update_fault_reports_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_fault_reports_modtime BEFORE UPDATE ON public.fault_reports FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: inspections update_inspections_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inspections_modtime BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: logbook_entries update_logbook_entries_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_logbook_entries_modtime BEFORE UPDATE ON public.logbook_entries FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: operators update_operators_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_operators_modtime BEFORE UPDATE ON public.operators FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: project_equipment update_project_equipment_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_project_equipment_updated_at BEFORE UPDATE ON public.project_equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: revisions update_revisions_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_revisions_modtime BEFORE UPDATE ON public.revisions FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: service_visits update_service_visits_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_visits_modtime BEFORE UPDATE ON public.service_visits FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: users update_users_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


--
-- Name: checklist_template_items checklist_template_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_template_items
    ADD CONSTRAINT checklist_template_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.checklist_templates(id) ON DELETE CASCADE;


--
-- Name: contact_persons contact_persons_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_persons
    ADD CONSTRAINT contact_persons_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: defects defects_revision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.defects
    ADD CONSTRAINT defects_revision_id_fkey FOREIGN KEY (revision_id) REFERENCES public.revisions(id) ON DELETE CASCADE;


--
-- Name: equipment_configurations equipment_configurations_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_configurations
    ADD CONSTRAINT equipment_configurations_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment equipment_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: equipment_files equipment_files_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_files
    ADD CONSTRAINT equipment_files_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment_operators equipment_operators_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_operators
    ADD CONSTRAINT equipment_operators_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment_operators equipment_operators_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipment_operators
    ADD CONSTRAINT equipment_operators_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: fault_reports fault_reports_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_reports
    ADD CONSTRAINT fault_reports_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: fault_reports fault_reports_logbook_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_reports
    ADD CONSTRAINT fault_reports_logbook_entry_id_fkey FOREIGN KEY (logbook_entry_id) REFERENCES public.logbook_entries(id) ON DELETE CASCADE;


--
-- Name: fault_reports fault_reports_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fault_reports
    ADD CONSTRAINT fault_reports_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inspections inspections_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: logbook_entries logbook_entries_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logbook_entries
    ADD CONSTRAINT logbook_entries_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: logbook_entries logbook_entries_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logbook_entries
    ADD CONSTRAINT logbook_entries_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: project_equipment project_equipment_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_equipment
    ADD CONSTRAINT project_equipment_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: project_equipment project_equipment_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_equipment
    ADD CONSTRAINT project_equipment_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: project_equipment project_equipment_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_equipment
    ADD CONSTRAINT project_equipment_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.users(id);


--
-- Name: project_equipment project_equipment_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_equipment
    ADD CONSTRAINT project_equipment_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: projects projects_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: revisions revisions_configuration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisions
    ADD CONSTRAINT revisions_configuration_id_fkey FOREIGN KEY (configuration_id) REFERENCES public.equipment_configurations(id) ON DELETE SET NULL;


--
-- Name: revisions revisions_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisions
    ADD CONSTRAINT revisions_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: service_visits service_visits_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_visits
    ADD CONSTRAINT service_visits_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: user_equipment_assignments user_equipment_assignments_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_equipment_assignments
    ADD CONSTRAINT user_equipment_assignments_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: user_equipment_assignments user_equipment_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_equipment_assignments
    ADD CONSTRAINT user_equipment_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

