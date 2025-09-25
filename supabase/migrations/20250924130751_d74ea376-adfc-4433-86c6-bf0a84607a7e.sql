-- Insert sample data for TransparencyBot

-- Insert sample sectors
INSERT INTO public.sectors (name) VALUES 
('Education'),
('Health'),
('Agriculture'),
('Infrastructure'),
('Water and Sanitation'),
('Transport'),
('Energy'),
('Security');

-- Insert sample vendors
INSERT INTO public.vendors (name, contact_info) VALUES 
('BuildTech Ltd', '{"email": "info@buildtech.ug", "phone": "+256700123456"}'),
('EduSupply Co', '{"email": "contact@edusupply.ug", "phone": "+256700234567"}'),
('HealthCare Solutions', '{"email": "hello@healthcare.ug", "phone": "+256700345678"}'),
('AgriDev Uganda', '{"email": "sales@agridev.ug", "phone": "+256700456789"}');

-- Insert sample users (auditors and procurement officers)
INSERT INTO auth.users (id, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'auditor@transparency.gov.ug'),
('22222222-2222-2222-2222-222222222222', 'procurement@finance.gov.ug');

INSERT INTO public.users (id, username, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'auditor_admin', 'auditor'),
('22222222-2222-2222-2222-222222222222', 'procurement_officer', 'procurement');

-- Insert sample budget data
INSERT INTO public.budgets (fiscal_year, ministry, programme, district, sector_id, allocated_amount, revised_amount, actual_expenditure, funding_source)
SELECT 
    '2024',
    ministries.name,
    programmes.name,
    districts.name,
    sectors.id,
    amounts.allocated,
    amounts.revised,
    amounts.actual,
    'Government Treasury'
FROM 
    (VALUES 
        ('Ministry of Education'),
        ('Ministry of Health'),
        ('Ministry of Agriculture')
    ) AS ministries(name),
    (VALUES 
        ('Primary Education'),
        ('Secondary Education'),
        ('Higher Education'),
        ('Primary Healthcare'),
        ('Specialized Healthcare'),
        ('Agricultural Extension'),
        ('Crop Development')
    ) AS programmes(name),
    (VALUES 
        ('Kampala'),
        ('Wakiso'),
        ('Mukono')
    ) AS districts(name),
    (VALUES 
        (50000000, 48000000, 45000000),
        (75000000, 70000000, 68000000),
        (30000000, 32000000, 29000000)
    ) AS amounts(allocated, revised, actual),
    public.sectors
WHERE sectors.name IN ('Education', 'Health', 'Agriculture')
LIMIT 20;