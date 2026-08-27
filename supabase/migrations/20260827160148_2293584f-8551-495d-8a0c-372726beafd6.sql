INSERT INTO public.authors (slug, name, role_title, bio) VALUES
('explorers-desk','Explorers Desk','Editorial team','The Explorers editorial team tracks what is changing in AI and technology and turns it into something you can use.'),
('aisha-rao','Aisha Rao','AI engineer & writer','Builds LLM systems and writes about the parts that are actually hard.'),
('marco-vidal','Marco Vidal','Developer educator','Teaches programming to people who did not think they could learn it.');

INSERT INTO public.topics (slug, title, summary, icon) VALUES
('ai-agents','AI Agents','Systems that plan, use tools and act toward a goal instead of just answering.','compass'),
('llms','Large Language Models','How modern language models work and how to build with them.','brain'),
('rag','Retrieval-Augmented Generation','Grounding model answers in your own data.','library'),
('python','Python','The default language for AI, automation and data work.','terminal'),
('ai-tools','AI Tools','The tools worth your time, and what they replace.','wrench'),
('mcp','Model Context Protocol','A standard way to connect models to tools and data.','plug'),
('careers','Technology Careers','Roles, skills and realistic progression.','route');

INSERT INTO public.tags (slug, label, kind) VALUES
('ai','AI','topic'),('coding','Coding','topic'),('beginner','Beginner','level'),('intermediate','Intermediate','level'),
('advanced','Advanced','level'),('free','Free','cost'),('developer','Developer','audience'),('student','Student','audience'),
('agents','Agents','topic'),('rag','RAG','topic'),('python','Python','topic'),('career','Career','topic'),('tools','Tools','topic'),('automation','Automation','topic');

INSERT INTO public.careers (slug, title, overview, role_summary, technical_skills, soft_skills, progression, portfolio_expectations, interview_prep, tools_used, related_roles) VALUES
('ai-engineer','AI Engineer','AI engineers turn models into products: retrieval, tools, evaluation, latency, cost and reliability.','You design and ship systems built on top of models rather than training models from scratch.',
 '{Python,"APIs & HTTP","LLM prompting","RAG & vector search","Agent & tool design",Evaluation,"Cloud deployment",Observability}',
 '{"Problem framing","Writing clearly","Working with ambiguity","Product sense"}',
 '[{"stage":"Beginner","focus":"Python, APIs, first LLM app"},{"stage":"Intermediate","focus":"RAG, evaluation, structured outputs"},{"stage":"Advanced","focus":"Agents, tool use, production reliability and cost"}]'::jsonb,
 '{"2-3 working apps with public demos","One project with real users or real data","A written breakdown of one hard bug you fixed"}',
 '{"Explain RAG end to end","Debug a bad retrieval example live","Discuss evaluation and failure modes","Estimate cost and latency"}',
 '{Python,"OpenAI/Gemini APIs",LangChain,LangGraph,pgvector,Docker}','{"ML Engineer","Software Engineer","Data Scientist"}'),
('ml-engineer','ML Engineer','ML engineers build, train and serve models and the pipelines around them.','You own data pipelines, training, deployment and monitoring of models.',
 '{Python,"Math & statistics",PyTorch,"Feature engineering",MLOps,"Model serving",SQL}','{"Rigour","Experiment discipline",Collaboration}',
 '[{"stage":"Beginner","focus":"Python, NumPy, classical ML"},{"stage":"Intermediate","focus":"Deep learning, pipelines, experiment tracking"},{"stage":"Advanced","focus":"Serving, scaling, monitoring, drift"}]'::jsonb,
 '{"A trained model with an honest evaluation writeup","One deployed inference endpoint"}','{"Bias-variance and overfitting","Explain a training pipeline","Metrics for imbalanced data"}',
 '{PyTorch,scikit-learn,"Weights & Biases",Docker,Kubernetes}','{"AI Engineer","Data Scientist","Research Engineer"}'),
('software-engineer','Software Engineer','Software engineers build and maintain the systems everything else runs on.','You design, write, review and operate software with other people.',
 '{"One language deeply","Data structures & algorithms",Git,Databases,"HTTP & APIs",Testing,"CI/CD"}','{"Code review","Communication",Ownership}',
 '[{"stage":"Beginner","focus":"Language fundamentals, Git, small apps"},{"stage":"Intermediate","focus":"Databases, APIs, testing, review"},{"stage":"Advanced","focus":"Architecture, scale, mentoring"}]'::jsonb,
 '{"Two apps you can demo and explain","Visible commit history"}','{"Data structures","System design basics","Debugging out loud"}','{Git,VS Code,Postgres,Docker}','{"AI Engineer","Cloud Engineer"}'),
('data-scientist','Data Scientist','Data scientists answer questions with data and communicate the answer.','You frame questions, analyse data and turn findings into decisions.',
 '{Python,SQL,Statistics,"Pandas & NumPy",Visualisation,"Experiment design"}','{Storytelling,Scepticism,"Stakeholder communication"}',
 '[{"stage":"Beginner","focus":"SQL, pandas, plotting"},{"stage":"Intermediate","focus":"Statistics, A/B tests, modelling"},{"stage":"Advanced","focus":"Causal inference, influence on strategy"}]'::jsonb,
 '{"One analysis notebook with a clear recommendation","One dashboard"}','{"SQL joins and windows","Explain p-values simply","Case study analysis"}','{Python,SQL,Jupyter,dbt}','{"Data Analyst","ML Engineer"}'),
('cybersecurity-engineer','Cybersecurity Engineer','Security engineers find and reduce the ways systems can be broken.','You defend systems, review code and respond to incidents.',
 '{Networking,Linux,"Web security","Cryptography basics","Threat modelling","Incident response"}','{"Careful thinking","Clear reporting",Ethics}',
 '[{"stage":"Beginner","focus":"Networking, Linux, OWASP Top 10"},{"stage":"Intermediate","focus":"Pentesting, detection, hardening"},{"stage":"Advanced","focus":"Architecture, red/blue teaming"}]'::jsonb,
 '{"CTF writeups","One hardening or audit report"}','{"Explain XSS and CSRF","Walk through an incident","Threat model a small app"}','{Wireshark,"Burp Suite",Nmap,Linux}','{"Cloud Engineer","Software Engineer"}'),
('web-developer','Web Developer','Web developers build the interfaces most people actually touch.','You build accessible, fast interfaces and the APIs behind them.',
 '{HTML,CSS,JavaScript,TypeScript,React,"APIs & auth",Accessibility,Performance}','{"Attention to detail",Empathy,"Design sense"}',
 '[{"stage":"Beginner","focus":"HTML, CSS, JS, first deployed site"},{"stage":"Intermediate","focus":"React, TypeScript, data fetching, auth"},{"stage":"Advanced","focus":"Performance, accessibility, architecture"}]'::jsonb,
 '{"Three deployed sites","One project with real auth and data"}','{"Explain the render path","Debug a layout live","Accessibility basics"}','{React,TypeScript,Vite,Tailwind}','{"Software Engineer","UX Engineer"}');

INSERT INTO public.roadmaps (slug, title, description, difficulty, estimated_hours, career_id) VALUES
('ai-engineer','AI Engineer','From Python fundamentals to production AI systems with retrieval, tools and agents.','intermediate',180,(SELECT id FROM public.careers WHERE slug='ai-engineer')),
('software-engineer','Software Engineer','The durable fundamentals: one language, data structures, databases, APIs and shipping.','beginner',200,(SELECT id FROM public.careers WHERE slug='software-engineer')),
('machine-learning-engineer','Machine Learning Engineer','Math, classical ML, deep learning and getting models into production.','advanced',220,(SELECT id FROM public.careers WHERE slug='ml-engineer')),
('ai-automation-builder','AI Automation Builder','Build useful automations with APIs, workflows and models — without a CS degree.','beginner',60,NULL),
('data-scientist','Data Scientist','SQL, statistics and analysis that changes decisions.','intermediate',160,(SELECT id FROM public.careers WHERE slug='data-scientist')),
('cybersecurity','Cybersecurity','Networking, Linux and web security through to detection and response.','intermediate',180,(SELECT id FROM public.careers WHERE slug='cybersecurity-engineer')),
('web-developer','Web Developer','HTML to production React with accessibility and performance built in.','beginner',150,(SELECT id FROM public.careers WHERE slug='web-developer'));

INSERT INTO public.roadmap_nodes (roadmap_id, slug, title, description, difficulty, estimated_hours, skills, group_label, position_x, position_y, sort)
SELECT r.id, v.slug, v.title, v.description, v.difficulty::public.difficulty, v.hours, v.skills::text[], v.grp, v.x, v.y, v.sort
FROM public.roadmaps r,
(VALUES
 ('python','Python','Syntax, data structures, functions and enough object-oriented code to read real projects.','beginner',30,'{Python,"Problem solving"}','Foundations',0,0,1),
 ('math','Math you actually need','Linear algebra intuition, probability and just enough calculus to read papers.','beginner',20,'{"Linear algebra",Probability}','Foundations',-1,0,2),
 ('systems','Systems & APIs','HTTP, JSON, auth, environments and how services talk to each other.','beginner',18,'{HTTP,APIs,Git}','Foundations',1,0,3),
 ('llm-basics','How LLMs work','Tokens, context windows, embeddings, sampling and why models make things up.','intermediate',16,'{"LLM fundamentals",Prompting}','Core',0,1,4),
 ('machine-learning','Machine learning','Supervised learning, evaluation and the vocabulary the field runs on.','intermediate',34,'{"scikit-learn",Evaluation}','Core',-1,1,5),
 ('generative-ai','Generative AI','Structured outputs, function calling, multimodal input and prompt engineering that survives production.','intermediate',22,'{"Structured output","Function calling"}','Core',0,2,6),
 ('rag','RAG','Chunking, embeddings, vector search, reranking and evaluating retrieval quality.','intermediate',26,'{"Vector search",Chunking,Evaluation}','Applied',-1,3,7),
 ('agents','AI agents','Planning, tool use, memory, loops and the guardrails that stop them going rogue.','advanced',28,'{"Agent design","Tool use"}','Applied',1,3,8),
 ('production','Production AI','Evaluation harnesses, caching, cost control, latency, observability and safety.','advanced',30,'{Observability,"Cost control",Evals}','Ship',0,4,9)
) AS v(slug,title,description,difficulty,hours,skills,grp,x,y,sort)
WHERE r.slug = 'ai-engineer';

INSERT INTO public.roadmap_edges (roadmap_id, source_node_id, target_node_id)
SELECT n1.roadmap_id, n1.id, n2.id
FROM public.roadmap_nodes n1
JOIN public.roadmap_nodes n2 ON n2.roadmap_id = n1.roadmap_id
JOIN public.roadmaps r ON r.id = n1.roadmap_id AND r.slug='ai-engineer'
WHERE (n1.slug,n2.slug) IN (
 ('python','llm-basics'),('math','machine-learning'),('systems','llm-basics'),
 ('python','machine-learning'),('machine-learning','generative-ai'),('llm-basics','generative-ai'),
 ('generative-ai','rag'),('generative-ai','agents'),('rag','production'),('agents','production'));

INSERT INTO public.roadmap_nodes (roadmap_id, slug, title, description, difficulty, estimated_hours, skills, group_label, position_x, position_y, sort)
SELECT r.id, v.slug, v.title, v.description, v.difficulty::public.difficulty, v.hours, v.skills::text[], v.grp, v.x, v.y, v.sort
FROM public.roadmaps r,
(VALUES
 ('language','Pick one language','Go deep in one language before collecting more.','beginner',40,'{Programming}','Foundations',0,0,1),
 ('git','Git & collaboration','Branches, reviews, and not being afraid of history.','beginner',10,'{Git}','Foundations',1,0,2),
 ('dsa','Data structures & algorithms','The vocabulary of every technical interview and most good code.','intermediate',45,'{"Data structures",Algorithms}','Core',0,1,3),
 ('databases','Databases','Relational modelling, SQL, indexes and transactions.','intermediate',30,'{SQL,Modelling}','Core',1,1,4),
 ('apis','APIs & the web','HTTP, REST, auth and how a request becomes a response.','intermediate',25,'{HTTP,APIs}','Core',-1,1,5),
 ('testing','Testing & CI','Tests you trust and a pipeline that runs them.','intermediate',18,'{Testing,"CI/CD"}','Ship',0,2,6),
 ('architecture','Architecture & scale','Caching, queues, boundaries and trade-offs.','advanced',35,'{Architecture,Caching}','Ship',0,3,7)
) AS v(slug,title,description,difficulty,hours,skills,grp,x,y,sort)
WHERE r.slug = 'software-engineer';

INSERT INTO public.roadmap_edges (roadmap_id, source_node_id, target_node_id)
SELECT n1.roadmap_id, n1.id, n2.id FROM public.roadmap_nodes n1
JOIN public.roadmap_nodes n2 ON n2.roadmap_id=n1.roadmap_id
JOIN public.roadmaps r ON r.id=n1.roadmap_id AND r.slug='software-engineer'
WHERE (n1.slug,n2.slug) IN (('language','dsa'),('git','dsa'),('language','apis'),('dsa','databases'),('apis','testing'),('databases','testing'),('testing','architecture'));

INSERT INTO public.roadmap_nodes (roadmap_id, slug, title, description, difficulty, estimated_hours, skills, group_label, position_x, position_y, sort)
SELECT r.id, v.slug, v.title, v.description, v.difficulty::public.difficulty, v.hours, v.skills::text[], v.grp, v.x, v.y, v.sort
FROM public.roadmaps r,
(VALUES
 ('spot','Spot the repetitive task','Find a task you do weekly that a machine could do.','beginner',2,'{"Problem framing"}','Start',0,0,1),
 ('apis','APIs without fear','Keys, requests, responses, rate limits.','beginner',8,'{APIs,HTTP}','Start',1,0,2),
 ('llm-call','Your first model call','Send a prompt, get structured output back.','beginner',6,'{Prompting,"Structured output"}','Build',0,1,3),
 ('workflow','Chain it into a workflow','Triggers, steps, error handling, retries.','beginner',12,'{Automation,Workflows}','Build',0,2,4),
 ('ship','Ship it to someone else','Deploy, schedule, log, and let a real person use it.','intermediate',14,'{Deployment,Logging}','Ship',0,3,5)
) AS v(slug,title,description,difficulty,hours,skills,grp,x,y,sort)
WHERE r.slug='ai-automation-builder';

INSERT INTO public.roadmap_edges (roadmap_id, source_node_id, target_node_id)
SELECT n1.roadmap_id, n1.id, n2.id FROM public.roadmap_nodes n1
JOIN public.roadmap_nodes n2 ON n2.roadmap_id=n1.roadmap_id
JOIN public.roadmaps r ON r.id=n1.roadmap_id AND r.slug='ai-automation-builder'
WHERE (n1.slug,n2.slug) IN (('spot','llm-call'),('apis','llm-call'),('llm-call','workflow'),('workflow','ship'));

INSERT INTO public.roadmap_nodes (roadmap_id, slug, title, description, difficulty, estimated_hours, skills, group_label, position_x, position_y, sort)
SELECT r.id, v.slug, v.title, v.description, v.difficulty::public.difficulty, v.hours, v.skills::text[], v.grp, v.x, v.y, v.sort
FROM public.roadmaps r,
(VALUES
 ('html','HTML & semantics','Structure first: headings, landmarks, forms.','beginner',10,'{HTML,Accessibility}','Foundations',0,0,1),
 ('css','CSS & layout','Flexbox, grid, responsive design, design tokens.','beginner',20,'{CSS,Responsive}','Foundations',1,0,2),
 ('js','JavaScript','The language of the browser, properly.','beginner',30,'{JavaScript}','Core',0,1,3),
 ('react','React & TypeScript','Components, state, data fetching, types.','intermediate',35,'{React,TypeScript}','Core',0,2,4),
 ('data','Data, auth & APIs','Talking to a backend without leaking secrets.','intermediate',25,'{APIs,Auth}','Applied',1,2,5),
 ('perf','Performance & a11y','Fast, accessible, measured.','advanced',20,'{Performance,Accessibility}','Ship',0,3,6)
) AS v(slug,title,description,difficulty,hours,skills,grp,x,y,sort)
WHERE r.slug='web-developer';

INSERT INTO public.roadmap_edges (roadmap_id, source_node_id, target_node_id)
SELECT n1.roadmap_id, n1.id, n2.id FROM public.roadmap_nodes n1
JOIN public.roadmap_nodes n2 ON n2.roadmap_id=n1.roadmap_id
JOIN public.roadmaps r ON r.id=n1.roadmap_id AND r.slug='web-developer'
WHERE (n1.slug,n2.slug) IN (('html','js'),('css','js'),('js','react'),('react','data'),('data','perf'),('react','perf'));

INSERT INTO public.roadmap_nodes (roadmap_id, slug, title, description, difficulty, estimated_hours, skills, group_label, position_x, position_y, sort)
SELECT r.id, v.slug, v.title, v.description, v.difficulty::public.difficulty, v.hours, v.skills::text[], v.grp, v.x, v.y, v.sort
FROM public.roadmaps r,
(VALUES
 ('python','Python & pandas','Load, clean and reshape real data.','beginner',30,'{Python,Pandas}','Foundations',0,0,1),
 ('sql','SQL','Joins, aggregates, window functions.','beginner',25,'{SQL}','Foundations',1,0,2),
 ('stats','Statistics','Distributions, uncertainty, significance.','intermediate',35,'{Statistics}','Core',0,1,3),
 ('viz','Visualisation & storytelling','Charts that answer a question.','intermediate',20,'{Visualisation}','Core',1,1,4),
 ('ml','Modelling','Regression, classification, honest evaluation.','intermediate',30,'{"scikit-learn"}','Applied',0,2,5),
 ('experiments','Experiments & causality','A/B tests and what they cannot tell you.','advanced',25,'{"Experiment design"}','Applied',1,2,6)
) AS v(slug,title,description,difficulty,hours,skills,grp,x,y,sort)
WHERE r.slug='data-scientist';

INSERT INTO public.roadmap_edges (roadmap_id, source_node_id, target_node_id)
SELECT n1.roadmap_id,n1.id,n2.id FROM public.roadmap_nodes n1
JOIN public.roadmap_nodes n2 ON n2.roadmap_id=n1.roadmap_id
JOIN public.roadmaps r ON r.id=n1.roadmap_id AND r.slug='data-scientist'
WHERE (n1.slug,n2.slug) IN (('python','stats'),('sql','stats'),('stats','ml'),('stats','viz'),('ml','experiments'),('viz','experiments'));

INSERT INTO public.roadmap_nodes (roadmap_id, slug, title, description, difficulty, estimated_hours, skills, group_label, position_x, position_y, sort)
SELECT r.id, v.slug, v.title, v.description, v.difficulty::public.difficulty, v.hours, v.skills::text[], v.grp, v.x, v.y, v.sort
FROM public.roadmaps r,
(VALUES
 ('networking','Networking','TCP/IP, DNS, TLS and how packets actually move.','beginner',25,'{Networking}','Foundations',0,0,1),
 ('linux','Linux & scripting','Permissions, processes, logs, bash.','beginner',25,'{Linux,Bash}','Foundations',1,0,2),
 ('websec','Web security','OWASP Top 10 with hands-on labs.','intermediate',35,'{"Web security"}','Core',0,1,3),
 ('crypto','Applied cryptography','Hashing, symmetric/asymmetric, key handling.','intermediate',20,'{Cryptography}','Core',1,1,4),
 ('offense','Offensive basics','Recon, exploitation, responsible disclosure.','advanced',30,'{Pentesting}','Applied',0,2,5),
 ('defense','Detection & response','Logging, alerting, incident handling.','advanced',30,'{"Incident response"}','Applied',1,2,6)
) AS v(slug,title,description,difficulty,hours,skills,grp,x,y,sort)
WHERE r.slug='cybersecurity';

INSERT INTO public.roadmap_edges (roadmap_id, source_node_id, target_node_id)
SELECT n1.roadmap_id,n1.id,n2.id FROM public.roadmap_nodes n1
JOIN public.roadmap_nodes n2 ON n2.roadmap_id=n1.roadmap_id
JOIN public.roadmaps r ON r.id=n1.roadmap_id AND r.slug='cybersecurity'
WHERE (n1.slug,n2.slug) IN (('networking','websec'),('linux','websec'),('websec','crypto'),('websec','offense'),('crypto','defense'),('offense','defense'));

INSERT INTO public.roadmap_nodes (roadmap_id, slug, title, description, difficulty, estimated_hours, skills, group_label, position_x, position_y, sort)
SELECT r.id, v.slug, v.title, v.description, v.difficulty::public.difficulty, v.hours, v.skills::text[], v.grp, v.x, v.y, v.sort
FROM public.roadmaps r,
(VALUES
 ('math','Math foundations','Linear algebra, probability, optimisation.','intermediate',40,'{"Linear algebra",Probability}','Foundations',0,0,1),
 ('python','Python & NumPy','Vectorised thinking.','beginner',25,'{Python,NumPy}','Foundations',1,0,2),
 ('classical','Classical ML','Trees, linear models, regularisation, validation.','intermediate',35,'{"scikit-learn"}','Core',0,1,3),
 ('deep','Deep learning','Backprop, CNNs, transformers, training loops.','advanced',45,'{PyTorch}','Core',0,2,4),
 ('pipelines','Data & experiment pipelines','Reproducibility and tracking.','advanced',25,'{MLOps}','Applied',1,2,5),
 ('serving','Serving & monitoring','Latency, drift, rollbacks.','advanced',30,'{Serving,Monitoring}','Ship',0,3,6)
) AS v(slug,title,description,difficulty,hours,skills,grp,x,y,sort)
WHERE r.slug='machine-learning-engineer';

INSERT INTO public.roadmap_edges (roadmap_id, source_node_id, target_node_id)
SELECT n1.roadmap_id,n1.id,n2.id FROM public.roadmap_nodes n1
JOIN public.roadmap_nodes n2 ON n2.roadmap_id=n1.roadmap_id
JOIN public.roadmaps r ON r.id=n1.roadmap_id AND r.slug='machine-learning-engineer'
WHERE (n1.slug,n2.slug) IN (('math','classical'),('python','classical'),('classical','deep'),('deep','pipelines'),('deep','serving'),('pipelines','serving'));