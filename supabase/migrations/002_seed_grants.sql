-- Starter grant catalogue.
-- Figures and conditions here are a summary for matching purposes only and the
-- agencies revise them regularly. Every grant page in the app links back to the
-- official source and tells people to verify there before applying.

insert into grants (
  slug, name, short_name, provider, funding_cap, funding_cap_sgd, funding_percent,
  eligible_business_stages, eligible_industries, eligible_initiatives,
  min_local_shareholding_percent, sme_only, max_years_operating, application_complexity,
  description, plain_english, requirements, covers, narrative_focus, official_url
) values
(
  'enterprise-development-grant', 'Enterprise Development Grant', 'EDG', 'Enterprise Singapore',
  'Scaled to project cost, no fixed public cap', null, 'Up to 50% of qualifying project costs',
  '{early_stage,growth,established}', '{}', '{innovation,productivity,overseas_expansion,sustainability,automation}',
  30, true, null, 'complex',
  'Supports projects that upgrade business foundations, drive innovation and productivity, or take the company into overseas markets.',
  'If you have a real project that makes the business stronger, like redesigning a process, building a new product line or going overseas, EDG can pay for up to half of the consultancy, software, equipment and manpower costs tied to it. It is the most flexible Enterprise Singapore grant but also the most paperwork heavy.',
  '{"Registered and operating in Singapore","Financially ready to start and complete the project","Project has not started before the application is submitted","Usually needs vendor quotations and a clear project scope"}',
  '{"Third party consultancy fees","Software and equipment","Internal manpower costs for the project","Training tied to the project"}',
  'Assessors look for a clear business problem, measurable outcomes such as revenue, productivity or headcount upgrades, and evidence the company can sustain the change after the grant ends.',
  'https://www.enterprisesg.gov.sg/financial-support/enterprise-development-grant'
),
(
  'productivity-solutions-grant', 'Productivity Solutions Grant', 'PSG', 'Enterprise Singapore / IMDA',
  'Per solution caps apply', null, 'Up to 50% of qualifying costs for pre-approved solutions',
  '{early_stage,growth,established}', '{}', '{digitalization,automation,productivity}',
  30, true, null, 'simple',
  'Co-funds pre-scoped IT solutions and equipment that improve productivity, chosen from a list of pre-approved vendors.',
  'Pick a pre-approved software or equipment package from the PSG list, like an accounting system, a POS or a warehouse scanner, and the grant covers up to half the cost. Because the solutions are pre-approved, the application is mostly filling in a form with the vendor quotation.',
  '{"Group annual sales turnover not more than S$100 million or group employment not more than 200","Purchase or lease must be for use in Singapore","Solution must be on the pre-approved list","No purchase or payment made before applying"}',
  '{"Pre-approved software subscriptions","Pre-approved equipment","Installation and setup bundled by the vendor"}',
  'Short. Explain which process the solution improves and how many staff or hours it affects.',
  'https://www.gobusiness.gov.sg/productivity-solutions-grant/'
),
(
  'market-readiness-assistance', 'Market Readiness Assistance', 'MRA', 'Enterprise Singapore',
  'S$100,000 per company per new market', 100000, 'Up to 50% of eligible costs',
  '{early_stage,growth,established}', '{}', '{overseas_expansion}',
  30, true, null, 'moderate',
  'Helps SMEs take their first steps into a new overseas market with market promotion, business development and market set up support.',
  'Planning to sell in a country you are not in yet? MRA helps pay for things like overseas trade fairs, finding partners or distributors, and setting up there. Each company can claim per new market, so it suits a focused one country plan.',
  '{"Business entity registered and operating in Singapore","Group sales turnover not more than S$100 million or group employment not more than 200","Target market must be new, generally with overseas sales below a set threshold in the last 3 years","Activities must not have started before applying"}',
  '{"Overseas marketing and trade fairs","Business matching and partner search","Market set up such as overseas company registration and legal advice"}',
  'Show why this market, who the target customers are, and a realistic plan to turn activity into first sales.',
  'https://www.enterprisesg.gov.sg/financial-support/market-readiness-assistance-grant'
),
(
  'startup-sg-founder', 'Startup SG Founder', 'SSG Founder', 'Enterprise Singapore',
  'S$50,000 start up capital grant', 50000, 'Grant with founder co-contribution',
  '{idea,early_stage}', '{}', '{innovation}',
  51, false, 1, 'moderate',
  'Mentorship and a start up capital grant for first time entrepreneurs with innovative business ideas, applied for through an Accredited Mentor Partner.',
  'For first time founders with an innovative idea. You apply through one of the Accredited Mentor Partners rather than directly, and if accepted you get mentoring plus a start up capital grant, with you putting in some of your own money as well.',
  '{"First time entrepreneur","Singapore Citizen or PR founder holding at least 51% of the company","Company registered recently, typically within 6 months of applying","Must be endorsed by an Accredited Mentor Partner"}',
  '{"Start up operating expenses","Prototyping and product development","Early marketing"}',
  'The innovation and what makes it defensible, the founding team, and a believable path to the first paying customers.',
  'https://www.startupsg.gov.sg/programmes/4894/startup-sg-founder'
),
(
  'startup-sg-tech', 'Startup SG Tech', 'SSG Tech', 'Enterprise Singapore',
  'Up to S$250,000 (POC) or S$500,000 (POV)', 500000, 'Grant for proof of concept or proof of value',
  '{early_stage,growth}', '{}', '{innovation}',
  30, false, 5, 'complex',
  'Funding for tech startups to develop proprietary technology from proof of concept to proof of value.',
  'For startups building their own technology. Proof of concept funding helps you show the tech works; proof of value funding helps you show customers will pay for it. Expect a detailed technical and commercial pitch.',
  '{"Singapore registered startup, generally under 5 years old","At least 30% local shareholding","Proprietary technology that is not yet commercialised","Technical team in Singapore"}',
  '{"Manpower for R&D","Equipment and materials for development","Professional services and IP"}',
  'Technical novelty, milestones with clear deliverables, and evidence of market pull for the tech.',
  'https://www.startupsg.gov.sg/programmes/4897/startup-sg-tech'
),
(
  'startup-sg-equity', 'Startup SG Equity', 'SSG Equity', 'Enterprise Singapore (SEEDS Capital)',
  'Co-investment alongside third party investors', null, 'Government co-invests with qualified investors',
  '{early_stage,growth}', '{}', '{innovation}',
  30, false, null, 'complex',
  'Government co-investment with independent third party investors into eligible Singapore based tech startups.',
  'This is equity, not a grant. If you are raising money from qualified investors, the government can invest alongside them, which stretches the round. You need investor interest first.',
  '{"Innovative, tech based startup with global potential","Singapore based with core activities here","Qualified third party investor committed to the round"}',
  '{"Growth capital for the company"}',
  'Usually led by the investor. Focus on the market size, traction and use of funds.',
  'https://www.startupsg.gov.sg/programmes/4899/startup-sg-equity'
),
(
  'cto-as-a-service', 'CTO-as-a-Service', 'CTOaaS', 'IMDA',
  'Free advisory', null, 'Fully funded digital consultancy for eligible SMEs',
  '{early_stage,growth,established}', '{}', '{digitalization}',
  30, true, null, 'simple',
  'Free access to digital consultants who assess your business needs and recommend suitable digital solutions.',
  'Not sure what software to buy? IMDA connects you with consultants who look at how your business runs and recommend digital tools for free. A good first step before applying for PSG.',
  '{"Registered and operating in Singapore","Meets the SME definition"}',
  '{"Digital needs assessment","Solution recommendations","Project management advice"}',
  'No narrative needed. Sign up through the portal.',
  'https://www.imda.gov.sg/how-we-can-help/smes-go-digital/cto-as-a-service'
),
(
  'advanced-digital-solutions', 'Advanced Digital Solutions', 'ADS', 'IMDA',
  'Project dependent caps', null, 'Co-funding for qualifying costs of advanced solutions',
  '{growth,established}', '{}', '{digitalization,automation,innovation}',
  30, false, null, 'moderate',
  'Supports adoption of more advanced, integrated digital solutions such as AI, data analytics and cybersecurity.',
  'For businesses past the basics who want to adopt more advanced tech like AI or data platforms. It funds part of the cost of pre-scoped advanced solutions from approved providers.',
  '{"Registered and operating in Singapore","Solution adopted from the ADS list","Solution must be used in Singapore"}',
  '{"Advanced software solutions","Integration and implementation","Hardware tied to the solution"}',
  'The business process being transformed and how success will be measured.',
  'https://www.imda.gov.sg/how-we-can-help/advanced-digital-solutions'
),
(
  'energy-efficiency-grant', 'Energy Efficiency Grant', 'EEG', 'Enterprise Singapore',
  'Per equipment caps apply', null, 'Co-funding for pre-approved energy efficient equipment',
  '{early_stage,growth,established}', '{food_beverage,retail,manufacturing,construction,logistics,tourism_hospitality,healthcare,other}', '{sustainability,productivity}',
  30, true, null, 'simple',
  'Co-funds pre-approved energy efficient equipment to help businesses cut energy use and costs.',
  'Replacing an old fridge, aircon, oven or motor with an energy efficient one? If the equipment is on the pre-approved list, the grant covers part of the price. Simple form, vendor led.',
  '{"Registered and operating in Singapore","At least 30% local shareholding","Equipment must be on the pre-approved list for your sector","No purchase made before applying"}',
  '{"Pre-approved energy efficient equipment"}',
  'Short. State the equipment being replaced and the expected energy saving.',
  'https://www.gobusiness.gov.sg/energy-efficiency-grant/'
),
(
  'enhanced-training-support-smes', 'Enhanced Training Support for SMEs', 'ETSS', 'SkillsFuture SG',
  'Course fee subsidy', null, 'Up to 90% of course fees for SkillsFuture supported courses',
  '{early_stage,growth,established}', '{}', '{workforce}',
  30, true, null, 'simple',
  'Higher course fee subsidies and absentee payroll support for SMEs that send employees to SkillsFuture supported courses.',
  'When your staff take a SkillsFuture supported course, SMEs get a much bigger subsidy on the course fee than larger companies. It is claimed through the course provider so there is almost no paperwork.',
  '{"Registered or incorporated in Singapore","Meets the SME definition","Employees must be sponsored by the company","Employee is a Singapore Citizen or PR"}',
  '{"Course fees","Absentee payroll while staff are on course"}',
  'No narrative needed.',
  'https://www.skillsfuture.gov.sg/'
),
(
  'career-conversion-programmes', 'Career Conversion Programmes', 'CCP', 'Workforce Singapore',
  'Salary support during training', null, 'Up to 70% of monthly salary during training (higher for mature or long term unemployed hires)',
  '{growth,established}', '{}', '{workforce,productivity}',
  0, false, null, 'moderate',
  'Salary and training support for companies that hire and reskill mid career workers into new roles.',
  'If you hire a mid career person into a role they have not done before, or redesign an existing employee''s job, CCP pays part of their salary while they train up.',
  '{"Hiring or redeploying Singapore Citizens or PRs","Role must be under a sector CCP","Structured training plan for the new role"}',
  '{"Salary support during the training period","Training costs"}',
  'The role, the training plan and how the person will be productive at the end.',
  'https://www.wsg.gov.sg/home/employers-industry-partners/workforce-development-job-redesign/career-conversion-programmes-employers'
),
(
  'enterprise-leadership-transformation', 'Enterprise Leadership for Transformation', 'ELT', 'Enterprise Singapore',
  'Programme fee subsidy', null, 'Up to 90% of programme fees for SMEs',
  '{growth,established}', '{}', '{productivity,innovation,overseas_expansion}',
  30, true, null, 'moderate',
  'A programme for SME business leaders to develop a business growth plan with coaching and workshops.',
  'For owners and senior leaders who want structured help writing a real growth plan. You attend workshops and get one to one coaching, with most of the fee subsidised.',
  '{"SME with annual turnover typically between S$1 million and S$100 million","Business leader is a Singapore Citizen or PR","Commitment to the full programme"}',
  '{"Programme fees","Coaching"}',
  'Your growth ambition and the leadership gap you want to close.',
  'https://www.enterprisesg.gov.sg/financial-support/enterprise-leadership-for-transformation'
),
(
  'agri-food-cluster-transformation', 'Agri-food Cluster Transformation Fund', 'ACT', 'Singapore Food Agency',
  'Project dependent', null, 'Co-funding for capability and productivity upgrades',
  '{early_stage,growth,established}', '{agrifood}', '{productivity,automation,innovation,sustainability}',
  30, false, null, 'complex',
  'Supports local farms in adopting productive and sustainable technologies and building capabilities.',
  'For local farms. It co-funds technology and systems that raise output and make farming more resource efficient. Expect a detailed project proposal with production targets.',
  '{"Licensed farm in Singapore","Project must raise productivity or resource efficiency","Production targets committed in the proposal"}',
  '{"Farming systems and equipment","Technology adoption","Capability development"}',
  'Production uplift in kg or yield terms, resource savings, and timeline to reach targets.',
  'https://www.sfa.gov.sg/'
),
(
  'business-improvement-fund', 'Business Improvement Fund', 'BIF', 'Singapore Tourism Board',
  'Project dependent', null, 'Co-funding for qualifying technology and productivity projects',
  '{early_stage,growth,established}', '{tourism_hospitality}', '{digitalization,productivity,innovation}',
  30, false, null, 'moderate',
  'Supports tourism businesses that adopt technology or redesign processes to raise productivity and visitor experience.',
  'For hotels, attractions, travel agents and other tourism businesses. It co-funds technology and process redesign that improves productivity or the visitor experience.',
  '{"Registered and operating in Singapore","Tourism related business","Project not started before applying"}',
  '{"Technology adoption","Process redesign consultancy","Related equipment"}',
  'The visitor or operational problem being solved and measurable productivity gains.',
  'https://www.stb.gov.sg/'
),
(
  'double-tax-deduction-internationalisation', 'Double Tax Deduction for Internationalisation', 'DTDi', 'IRAS / Enterprise Singapore',
  '200% tax deduction on qualifying expenses', null, 'Tax deduction, not a cash grant',
  '{early_stage,growth,established}', '{}', '{overseas_expansion}',
  0, false, null, 'simple',
  'A tax deduction of 200% on qualifying market expansion and investment development expenses.',
  'Not cash in hand, but it lowers your tax bill. Spending on things like overseas trade fairs and business trips can be deducted twice over, up to a yearly amount, claimed in your tax filing.',
  '{"Singapore tax resident company","Expenses are for qualifying internationalisation activities","Larger claims above the yearly threshold need approval"}',
  '{"Overseas trade fairs and missions","Overseas business development trips","Market research and feasibility studies"}',
  'No narrative needed below the auto claim threshold.',
  'https://www.iras.gov.sg/'
);
