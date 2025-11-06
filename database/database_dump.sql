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
-- Data for Name: checklist_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_templates (id, name, category, equipment_type, active, created_at) FROM stdin;
1	Denní kontrola jeřábu	daily	jerab	t	2025-08-21 19:34:28.205785
2	Denní kontrola jeřábu	daily	jerab	t	2025-08-25 20:55:16.000718
\.


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
-- Data for Name: daily_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_checks (id, logbook_entry_id, check_category, check_item, check_result, notes, created_at) FROM stdin;
1	5	visual	Nosná konstrukce	ok	Bez viditelných závad	2025-08-25 21:00:29.880542
2	5	functional	Funkce brzd	ok	Brzdy fungují správně	2025-08-25 21:00:29.880542
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
-- Data for Name: defects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.defects (id, revision_id, section, item_key, item_name, description, severity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: equipment_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment_files (id, equipment_id, file_name, file_path, file_type, file_size, content_type, description, created_at, updated_at) FROM stdin;
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
-- Data for Name: equipment_operators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.equipment_operators (id, equipment_id, operator_id, assigned_date, active, created_at) FROM stdin;
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
-- PostgreSQL database dump complete
--

