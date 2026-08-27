INSERT INTO public.articles (slug,title,subtitle,excerpt,why_it_matters,category,author_id,topic_id,reading_minutes,level,audience,tags,sources,seo_title,seo_description,status,featured,published_at) VALUES
('what-are-ai-agents','What Are AI Agents?','Beyond chat: models that plan, use tools and take action','An agent is a model given a goal, tools and a loop. That combination changes what software can do — and what can go wrong.','Agents move AI from answering questions to doing work, which changes how you design, test and trust software.','explained',(SELECT id FROM public.authors WHERE slug='aisha-rao'),(SELECT id FROM public.topics WHERE slug='ai-agents'),8,'beginner','{Student,Developer}','{ai,agents,beginner}','[{"label":"OpenAI function calling docs","url":"https://platform.openai.com/docs/guides/function-calling"}]'::jsonb,'What Are AI Agents? A Plain-English Guide','Agents are models with a goal, tools and a loop. Here is how they work, where they break, and how to build your first one.','published',true,now()-interval '1 day'),
('what-is-rag','What Is RAG?','Retrieval-augmented generation, explained without the jargon','RAG gives a model the right pages before it answers. Most "AI on your data" products are a retrieval problem wearing a model costume.','If your AI app answers from your own documents, retrieval quality — not the model — decides whether it is useful.','explained',(SELECT id FROM public.authors WHERE slug='aisha-rao'),(SELECT id FROM public.topics WHERE slug='rag'),7,'beginner','{Student,Developer}','{ai,rag,beginner}','[]'::jsonb,'What Is RAG? Retrieval-Augmented Generation Explained','Chunking, embeddings, vector search and reranking — what RAG actually is and how to evaluate it.','published',true,now()-interval '2 day'),
('how-llms-work','How LLMs Work','Tokens, context and prediction — the mental model that makes everything else click','A language model predicts the next token. Everything impressive and everything frustrating follows from that one sentence.','Understanding tokens and context explains hallucination, cost, latency and prompt behaviour in one go.','deep-dive',(SELECT id FROM public.authors WHERE slug='marco-vidal'),(SELECT id FROM public.topics WHERE slug='llms'),11,'intermediate','{Developer}','{ai,beginner}','[]'::jsonb,'How LLMs Work — Tokens, Context and Prediction','A practical mental model of large language models: tokenisation, context windows, embeddings and sampling.','published',true,now()-interval '4 day'),
('best-ai-coding-tools','Best AI Coding Tools','What each one is actually good at, and what it replaces','Coding assistants are not interchangeable. Here is how to pick based on what you are doing, not what is trending.','Choosing the wrong assistant costs you time and money; choosing well removes an hour of boilerplate a day.','analysis',(SELECT id FROM public.authors WHERE slug='explorers-desk'),(SELECT id FROM public.topics WHERE slug='ai-tools'),9,'beginner','{Student,Developer}','{ai,tools,coding}','[]'::jsonb,'Best AI Coding Tools in 2026 — Honest Comparison','A practical comparison of AI coding tools: what each is good at, pricing reality and when not to use one.','published',false,now()-interval '5 day'),
('how-to-start-learning-ai','How to Start Learning AI','A realistic first 8 weeks, with nothing skipped and nothing padded','You do not need a PhD, a GPU or a maths degree. You need Python, an API key and a project you actually want.','Most people quit AI learning because they start with theory instead of a working thing they built.','how-to',(SELECT id FROM public.authors WHERE slug='marco-vidal'),(SELECT id FROM public.topics WHERE slug='python'),10,'beginner','{Student}','{ai,beginner,python}','[]'::jsonb,'How to Start Learning AI — A Realistic 8-Week Plan','A week-by-week beginner plan for learning AI: Python, APIs, LLM basics, RAG and your first shipped project.','published',true,now()-interval '7 day'),
('what-is-mcp','What Is MCP?','The Model Context Protocol, and why every tool suddenly supports it','MCP is a standard way for models to discover and call tools. It is boring plumbing — which is exactly why it matters.','A shared protocol means the tools you build once can be used by many AI clients instead of one.','explained',(SELECT id FROM public.authors WHERE slug='aisha-rao'),(SELECT id FROM public.topics WHERE slug='mcp'),6,'intermediate','{Developer}','{ai,tools}','[]'::jsonb,'What Is MCP? The Model Context Protocol Explained','MCP gives models a standard way to discover and call tools. Here is the model, the pieces and where it fits.','published',false,now()-interval '9 day'),
('build-your-first-ai-app','How to Build Your First AI App','From empty folder to something you can send to a friend','A weekend-sized build: one input, one model call, one useful output — plus the three things beginners always get wrong.','Shipping one small AI app teaches more than ten tutorials, because deployment is where the real lessons live.','how-to',(SELECT id FROM public.authors WHERE slug='marco-vidal'),(SELECT id FROM public.topics WHERE slug='llms'),12,'beginner','{Student,Developer}','{ai,beginner,coding}','[]'::jsonb,'How to Build Your First AI App — Step by Step','Build and deploy a small AI app this weekend: setup, the model call, structured output, and shipping it.','published',false,now()-interval '11 day');

-- ARTICLE BLOCKS
INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'article', a.id, v.pos, v.type, v.data::jsonb
FROM public.articles a, (VALUES
 (0,'paragraph','{"text":"Ask a chatbot a question and it answers. Give a model a goal, a set of tools and permission to keep going until it is done, and you have something different: an agent."}'),
 (1,'key-takeaway','{"title":"The one-line definition","text":"An agent is a loop: the model decides an action, a tool runs it, the result comes back, and the model decides again — until the goal is met or a limit is hit."}'),
 (2,'heading','{"level":2,"text":"The four parts of every agent"}'),
 (3,'checklist','{"items":["A goal, stated clearly enough to be checkable","Tools it can call — search, code, a database, an API","Memory of what already happened","A stopping condition, so the loop ends"]}'),
 (4,'analogy','{"title":"Think of a new intern","text":"A chatbot is an intern who answers your question. An agent is an intern who is told the outcome you want, given access to the shared drive and the company card, and left to work. The access is what makes it useful — and what makes review essential."}'),
 (5,'heading','{"level":2,"text":"A minimal agent loop"}'),
 (6,'code','{"language":"python","code":"goal = \"Find the 3 newest papers on RAG evaluation and summarise each in 2 lines.\"\nhistory = []\n\nfor step in range(6):\n    decision = model.decide(goal, history, tools=[search, fetch_page])\n    if decision.done:\n        print(decision.answer)\n        break\n    result = run_tool(decision.tool, decision.args)\n    history.append((decision, result))","output":"step 1  search(\"RAG evaluation 2026\")\nstep 2  fetch_page(...)\nstep 3  done -> 3 summaries"}'),
 (7,'warning','{"title":"The loop is the dangerous part","text":"An agent with a broken stopping condition will happily spend your API budget in ten minutes. Always cap steps, cap cost, and log every tool call."}'),
 (8,'common-mistake','{"title":"Giving an agent tools it does not need","text":"Every extra tool widens the space of wrong decisions. Start with one tool. Add a second only when the first is reliable."}'),
 (9,'quiz','{"question":"What turns a language model into an agent?","options":["A bigger context window","A goal, tools and a loop","Fine-tuning on your data","A vector database"],"correctIndex":1,"explanation":"Size and data help, but the defining change is that the model can act repeatedly using tools until a goal is met."}'),
 (10,'paragraph','{"text":"Agents are worth reaching for when a task genuinely needs several steps and the steps are not known in advance. If you can write the steps down yourself, write a script — it will be faster, cheaper and easier to debug."}')
) AS v(pos,type,data) WHERE a.slug='what-are-ai-agents';

INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'article', a.id, v.pos, v.type, v.data::jsonb
FROM public.articles a, (VALUES
 (0,'paragraph','{"text":"A model only knows what is in its weights and what you put in the prompt. RAG is the discipline of putting the right thing in the prompt: retrieve first, then answer."}'),
 (1,'definition','{"term":"RAG","text":"Retrieval-Augmented Generation — search your own content for the passages most relevant to a question, then ask the model to answer using only those passages."}'),
 (2,'heading','{"level":2,"text":"The pipeline"}'),
 (3,'checklist','{"items":["Chunk your documents into passages that stand alone","Embed each chunk into a vector","Store vectors in a database that can search by similarity","At query time, embed the question and fetch the closest chunks","Rerank, then put the survivors in the prompt with a citation instruction"]}'),
 (4,'tip','{"title":"Chunking beats model choice","text":"Teams switch models hoping for better answers when the real problem is that their chunks split a table in half. Read your chunks before you blame the model."}'),
 (5,'code','{"language":"python","code":"chunks = split(document, size=800, overlap=120)\nvectors = embed(chunks)\ndb.upsert(vectors)\n\nhits = db.search(embed(question), k=8)\ntop = rerank(question, hits)[:3]\nanswer = model.answer(question, context=top, cite=True)","output":"3 chunks retrieved  |  answer grounded with 3 citations"}'),
 (6,'callout','{"title":"How to know it works","text":"Build a set of 30 real questions with known correct sources. Measure how often the right source appears in the retrieved set. That number, not vibes, tells you whether your RAG works."}'),
 (7,'quiz','{"question":"Your RAG app gives confident but wrong answers. What do you check first?","options":["Switch to a larger model","Inspect what was retrieved","Lower the temperature","Add more prompt instructions"],"correctIndex":1,"explanation":"If the right passage was never retrieved, no model and no prompt can save the answer."}')
) AS v(pos,type,data) WHERE a.slug='what-is-rag';

INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'article', a.id, v.pos, v.type, v.data::jsonb
FROM public.articles a, (VALUES
 (0,'paragraph','{"text":"Every impressive thing a language model does and every irritating thing it does come from the same mechanism: it predicts the next token, one at a time, from everything currently in its context."}'),
 (1,'definition','{"term":"Token","text":"A chunk of text — often a word piece. Models read and write tokens, not characters or words, which is why they can miscount letters."}'),
 (2,'heading','{"level":2,"text":"Context is working memory"}'),
 (3,'paragraph','{"text":"The context window is everything the model can see right now: system prompt, conversation, retrieved documents, tool results. Nothing outside it exists. This is why chat apps forget, and why RAG works."}'),
 (4,'analogy','{"title":"An extremely well-read improviser","text":"It has read almost everything and remembers none of it specifically. Ask a question and it improvises the most plausible continuation. Plausible is usually true — and sometimes confidently not."}'),
 (5,'code','{"language":"python","code":"for token in model.stream(prompt, temperature=0.2):\n    print(token, end=\"\")","output":"Lower temperature -> safer, more repetitive text\nHigher temperature -> more variety, more risk"}'),
 (6,'key-takeaway','{"title":"Why hallucination happens","text":"The model is optimised for plausible continuations, not for truth. Grounding it in retrieved text is what converts plausibility into accuracy."}'),
 (7,'quiz','{"question":"Why does an LLM forget what you said earlier in a long chat?","options":["It deletes old memories","Earlier text fell outside the context window","The temperature increased","It was not fine-tuned"],"correctIndex":1,"explanation":"Only what fits in the context window is visible to the model on each generation."}')
) AS v(pos,type,data) WHERE a.slug='how-llms-work';

INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'article', a.id, v.pos, v.type, v.data::jsonb
FROM public.articles a, (VALUES
 (0,'paragraph','{"text":"Every AI coding tool demos well. The difference shows up on day three, in a codebase with history, conventions and tests."}'),
 (1,'comparison','{"attributes":["Best at","Watch out for"],"items":[{"name":"In-editor completion","values":["Boilerplate, tests, repetitive edits","Confident wrong code in unfamiliar APIs"]},{"name":"Chat assistants","values":["Explaining unknown code, debugging","No repo context unless you paste it"]},{"name":"Agentic tools","values":["Multi-file refactors, scaffolding","Large diffs that need real review"]}]}'),
 (2,'tip','{"title":"Pick by task, not by brand","text":"Use completion while typing, chat while stuck, and an agent when the change spans files. Most productive developers use all three in a day."}'),
 (3,'common-mistake','{"title":"Accepting code you cannot explain","text":"If you could not defend the change in review, do not merge it. Speed you cannot maintain is debt."}')
) AS v(pos,type,data) WHERE a.slug='best-ai-coding-tools';

INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'article', a.id, v.pos, v.type, v.data::jsonb
FROM public.articles a, (VALUES
 (0,'paragraph','{"text":"The fastest way to learn AI is to build something small that you personally want, and to learn each concept at the moment it blocks you."}'),
 (1,'timeline','{"events":[{"date":"Week 1-2","title":"Python that sticks","text":"Variables, lists, dicts, functions, files. Write 10 tiny scripts."},{"date":"Week 3","title":"APIs","text":"Requests, JSON, keys, environment variables."},{"date":"Week 4","title":"First model call","text":"Prompt in, structured output out."},{"date":"Week 5-6","title":"RAG","text":"Chunk, embed, retrieve, cite."},{"date":"Week 7","title":"Evaluation","text":"30 test questions and an honest score."},{"date":"Week 8","title":"Ship","text":"Deploy it and give the link to one real person."}]}'),
 (2,'warning','{"title":"Do not start with maths","text":"Linear algebra is worth learning, but starting there is why most beginners quit in week two. Learn it when a concept demands it."}'),
 (3,'checklist','{"items":["Pick one project you actually want to exist","Book 5 hours a week and protect them","Finish ugly rather than plan perfect","Publish the repo, however small"]}')
) AS v(pos,type,data) WHERE a.slug='how-to-start-learning-ai';

INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'article', a.id, v.pos, v.type, v.data::jsonb
FROM public.articles a, (VALUES
 (0,'paragraph','{"text":"Before MCP, every AI client invented its own way to expose tools. Build an integration for one and it worked nowhere else."}'),
 (1,'definition','{"term":"MCP","text":"Model Context Protocol — a standard interface that lets an AI client discover a server''s tools and resources, and call them with typed arguments."}'),
 (2,'checklist','{"items":["A server exposes tools and resources","A client discovers them at connect time","The model chooses a tool and passes typed arguments","The result comes back into context"]}'),
 (3,'callout','{"title":"Why it spread so fast","text":"It is unglamorous plumbing that removes N×M integration work. Standards win when they make other people''s work disappear."}')
) AS v(pos,type,data) WHERE a.slug='what-is-mcp';

INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'article', a.id, v.pos, v.type, v.data::jsonb
FROM public.articles a, (VALUES
 (0,'paragraph','{"text":"Your first AI app should do one thing: take one input and return one output that is genuinely useful to you. Everything else is version two."}'),
 (1,'code','{"language":"python","code":"import os, json\nfrom openai import OpenAI\n\nclient = OpenAI(api_key=os.environ[\"API_KEY\"])\n\ndef summarise(notes: str) -> dict:\n    reply = client.chat.completions.create(\n        model=\"gpt-5-mini\",\n        messages=[\n            {\"role\": \"system\", \"content\": \"Return JSON: {summary, three_questions}\"},\n            {\"role\": \"user\", \"content\": notes},\n        ],\n        response_format={\"type\": \"json_object\"},\n    )\n    return json.loads(reply.choices[0].message.content)","output":"{\"summary\": \"...\", \"three_questions\": [\"...\", \"...\", \"...\"]}"}'),
 (2,'tip','{"title":"Ask for JSON from day one","text":"Structured output turns a demo into something other code can use."}'),
 (3,'common-mistake','{"title":"Hard-coding the API key","text":"Use environment variables. A key in a public repo is cancelled within minutes — and billed before that."}'),
 (4,'checklist','{"items":["One input, one output","Structured JSON response","Key in an environment variable","Deployed somewhere with a URL","Sent to one real person for feedback"]}')
) AS v(pos,type,data) WHERE a.slug='build-your-first-ai-app';

-- RESOURCES
INSERT INTO public.resources (slug,title,description,resource_type,category,url,organization,level,cost,has_free_tier,is_official,audience,tags,rating,last_reviewed,reviewer_notes) VALUES
('python-official-tutorial','The Python Tutorial','The official language tutorial. Dry in places, but correct and complete.','documentation','learn','https://docs.python.org/3/tutorial/','Python Software Foundation','beginner','free',true,true,'{Student,Developer}','{python,beginner,free}',4.5,current_date-20,'Best used alongside a project, not read end to end.'),
('automate-boring-stuff','Automate the Boring Stuff with Python','Free online book that teaches Python through small automations.','book','learn','https://automatetheboringstuff.com/','Al Sweigart','beginner','free',true,true,'{Student}','{python,beginner,automation,free}',4.8,current_date-15,'The most reliable first Python resource we recommend.'),
('cs50p','CS50 Introduction to Programming with Python','Harvard''s Python course. Structured, demanding, free to audit.','course','learn','https://cs50.harvard.edu/python/','Harvard University','beginner','freemium',true,true,'{Student}','{python,beginner}',4.7,current_date-30,'Strong if you want deadlines and structure.'),
('openai-api-docs','OpenAI API Documentation','Reference for chat completions, structured output and function calling.','documentation','ai','https://platform.openai.com/docs','OpenAI','intermediate','free',true,true,'{Developer}','{ai,tools}',4.4,current_date-10,'Read the structured output and function calling pages first.'),
('gemini-api-docs','Gemini API Documentation','Google''s model API reference, including multimodal input.','documentation','ai','https://ai.google.dev/docs','Google','intermediate','free',true,true,'{Developer}','{ai}',4.3,current_date-10,'Good free tier for learning.'),
('langchain-docs','LangChain Documentation','Framework docs for chains, retrieval and agents.','documentation','ai','https://python.langchain.com/','LangChain','intermediate','free',true,true,'{Developer}','{ai,agents,rag}',3.9,current_date-12,'Useful patterns; write the raw version once before adopting the framework.'),
('langgraph','LangGraph','Graph-based framework for building stateful agents with explicit control flow.','framework','ai','https://langchain-ai.github.io/langgraph/','LangChain','advanced','free',true,true,'{Developer}','{agents,ai}',4.2,current_date-8,'The clearest mental model we have found for agent loops.'),
('pgvector','pgvector','Vector similarity search inside Postgres. Fewer moving parts than a separate vector DB.','library','build','https://github.com/pgvector/pgvector','pgvector','intermediate','free',true,true,'{Developer}','{rag,ai}',4.6,current_date-14,'Start here before adopting a dedicated vector database.'),
('huggingface-hub','Hugging Face Hub','Models, datasets and demos, plus the transformers library.','documentation','ai','https://huggingface.co/','Hugging Face','intermediate','freemium',true,true,'{Developer}','{ai,free}',4.5,current_date-9,'Best single source of open models and datasets.'),
('kaggle-datasets','Kaggle Datasets','Thousands of public datasets and notebooks to practise on.','dataset','build','https://www.kaggle.com/datasets','Kaggle','beginner','free',true,true,'{Student}','{free}',4.2,current_date-18,'Great for practice; check licences before reuse.'),
('the-odin-project','The Odin Project','Free full-stack web development curriculum built around projects.','course','learn','https://www.theodinproject.com/','The Odin Project','beginner','free',true,true,'{Student}','{coding,free,beginner}',4.6,current_date-25,'Project-first structure keeps motivation up.'),
('mdn-web-docs','MDN Web Docs','The reference for HTML, CSS and JavaScript.','documentation','learn','https://developer.mozilla.org/','Mozilla','beginner','free',true,true,'{Developer,Student}','{coding,free}',4.9,current_date-5,'Always check MDN before a random blog post.'),
('roadmap-git','Pro Git','The complete free Git book.','book','learn','https://git-scm.com/book/en/v2','Git','beginner','free',true,true,'{Developer}','{coding,free}',4.5,current_date-40,'Read chapters 2 and 3, then come back when you break something.'),
('github-student-pack','GitHub Student Developer Pack','Free developer tools and credits for verified students.','tutorial','career','https://education.github.com/pack','GitHub','beginner','free',true,true,'{Student}','{career,free}',4.7,current_date-11,'Worth applying for on day one if you are a student.'),
('interview-tech-guide','Tech Interview Handbook','Free, practical interview preparation covering coding and behavioural rounds.','tutorial','career','https://www.techinterviewhandbook.org/','Tech Interview Handbook','intermediate','free',true,false,'{Student,Developer}','{career,free}',4.6,current_date-16,'The behavioural section is better than most paid courses.'),
('ragas-eval','Ragas','Open-source evaluation toolkit for retrieval-augmented systems.','library','ai','https://docs.ragas.io/','Ragas','advanced','free',true,true,'{Developer}','{rag,ai}',4.1,current_date-7,'Pairs well with a hand-written test set of 30 questions.'),
('fastapi-docs','FastAPI Documentation','Python web framework docs — the fastest way to put a model behind an API.','documentation','build','https://fastapi.tiangolo.com/','FastAPI','intermediate','free',true,true,'{Developer}','{python,coding}',4.8,current_date-13,'The tutorial is genuinely excellent.'),
('papers-with-code','Papers with Code','Research papers paired with their implementations.','documentation','learn','https://paperswithcode.com/','Papers with Code','advanced','free',true,true,'{Developer}','{ai}',4.3,current_date-22,'Use it to check whether a paper is reproducible.');

-- TOOLS
INSERT INTO public.tools (slug,name,tagline,description,category,url,pricing,tags) VALUES
('cursor','Cursor','AI-native code editor','An editor built around AI edits across multiple files, with repository context.','coding','https://cursor.com','freemium','{coding,ai}'),
('github-copilot','GitHub Copilot','Inline code completion','Completion and chat inside your editor, free for verified students.','coding','https://github.com/features/copilot','freemium','{coding,ai}'),
('claude-code','Claude Code','Terminal coding agent','An agent that works in your repository from the command line.','coding','https://claude.com/product/claude-code','paid','{coding,agents}'),
('chatgpt','ChatGPT','General assistant','Explaining unfamiliar code, drafting, and thinking out loud.','ai','https://chat.openai.com','freemium','{ai}'),
('n8n','n8n','Workflow automation','Visual automation with code escape hatches and self-hosting.','automation','https://n8n.io','freemium','{automation,tools}'),
('supabase-tool','Postgres + pgvector','Database with vector search','A relational database that also handles embeddings — one system instead of two.','build','https://github.com/pgvector/pgvector','free','{rag,build}');

-- PROJECTS
INSERT INTO public.projects (slug,title,problem,outcome,difficulty,estimated_hours,tech_stack,prerequisites,skills,architecture,extensions,portfolio_advice) VALUES
('ai-study-assistant','AI Study Assistant','Students re-read notes without knowing whether anything stuck.','A tool that turns your notes into a summary, three questions and a spaced review list.','beginner',10,'{Python,"LLM API",SQLite}','{"Basic Python","An API key"}','{Prompting,"Structured output","Data persistence"}','Notes go in, a single model call returns JSON, results are stored in SQLite and rendered in a small web UI.','{"Add retrieval over your full notes folder","Add voice input","Add tool use so it can search the web","Turn it into an agent that plans a week of revision"}','Record a 60-second demo using your own real notes — specificity beats polish.'),
('rag-assistant','RAG Assistant Over Your Own Documents','Model answers about your documents are confident and wrong.','A question-answering app that cites the exact passage it used.','intermediate',16,'{Python,pgvector,FastAPI}','{"Python","Understanding of embeddings"}','{Chunking,"Vector search",Reranking,Evaluation}','Ingest pipeline chunks and embeds documents into Postgres; the query path retrieves, reranks and answers with citations.','{"Add a reranker","Add an evaluation set of 30 questions","Support PDFs and tables","Add per-user document isolation"}','Publish your evaluation numbers. Honest metrics stand out more than a pretty UI.'),
('ai-chatbot','Domain Chatbot','Generic chatbots know nothing about your club, course or product.','A chatbot with a defined persona, a knowledge base and safe refusals.','beginner',8,'{Python,"LLM API",React}','{"Basic Python"}','{Prompting,"System design","Safety"}','A system prompt defines scope; out-of-scope questions get a defined refusal; conversation state lives client-side.','{"Add memory across sessions","Add analytics on unanswered questions","Add retrieval"}','Show the refusal behaviour in your demo — handling failure well is a senior signal.'),
('ai-research-assistant','AI Research Assistant','Reading twenty papers to answer one question takes a week.','An agent that searches, reads and summarises sources with links.','advanced',20,'{Python,LangGraph,"Search API"}','{"Agent basics","API experience"}','{"Agent design","Tool use","Cost control"}','A LangGraph loop with search and fetch tools, a step budget, and a synthesis step that must cite every claim.','{"Add a critic step","Add caching","Add PDF parsing","Add human approval before expensive steps"}','Log and show the agent trace. Reviewers care that you can debug an agent, not that it worked once.'),
('automation-workflow','Personal Automation Workflow','You do the same 20-minute task every week.','A scheduled automation that does it and messages you the result.','beginner',6,'{Python,"Cron/scheduler","Any API"}','{"Basic Python"}','{Automation,APIs,Scheduling}','A scheduled job calls an API, transforms the result with a model, and posts it to email or chat.','{"Add error alerting","Add a small dashboard","Let other people trigger it"}','Track hours saved per month — that number is the whole story.'),
('ai-portfolio-project','AI Portfolio Site That Explains Itself','Portfolios list projects without explaining the thinking.','A portfolio where each project has an architecture diagram and a written trade-off section.','intermediate',12,'{React,TypeScript,"LLM API"}','{"Basic web development"}','{"Web development","Technical writing","Design"}','Static site with structured project data; an optional model call drafts summaries that you edit.','{"Add search","Add a reading-time estimate","Add analytics"}','Write the trade-offs yourself. Interviewers can tell when it was generated.');

INSERT INTO public.challenges (slug,number,title,statement,requirements,bonus,judging,deadline,project_id) VALUES
('build-challenge-07',7,'Explorer Build Challenge #07 — Build an AI study assistant',
 'Build something that helps a student actually retain what they read. It must take real notes as input and return something more useful than a summary.',
 '{"Accepts pasted or uploaded notes","Returns structured output, not a wall of text","Deployed with a public link","A README explaining one design decision"}',
 '{"Retrieval over a full notes folder","Spaced repetition scheduling","Voice input","An evaluation of answer quality"}',
 '{"Usefulness to a real student","Clarity of the build writeup","Honest handling of failure cases"}',
 current_date+21,(SELECT id FROM public.projects WHERE slug='ai-study-assistant'));

-- LEARNING PATHS
INSERT INTO public.learning_paths (slug,title,description,audience,prerequisites,estimated_hours,difficulty,skills,milestones,next_steps) VALUES
('python-field-manual','Python Field Manual','A mission-structured Python course: every chapter ends with something that runs.','Complete beginners who want to write real programs, not follow along.','{"A computer","Five hours a week"}',40,'beginner','{Python,"Problem solving",Debugging}','{"First script that runs","First program with data structures","First project shipped"}','{"AI Fundamentals","AI Automation Builder roadmap"}'),
('ai-fundamentals','AI Fundamentals','What models are, what they can and cannot do, and how to build with them responsibly.','Anyone who wants to understand AI beyond headlines.','{"Basic Python helps but is not required"}',24,'beginner','{"LLM fundamentals",Prompting,Evaluation}','{"Explain tokens and context","Run your first model call","Evaluate an answer honestly"}','{"Generative AI","RAG in practice"}'),
('generative-ai','Generative AI in Practice','Structured outputs, function calling and prompts that survive contact with production.','Developers who have made a model call and want reliability.','{"Python","One completed model call"}',30,'intermediate','{"Structured output","Function calling","Prompt design"}','{"Reliable JSON output","A working tool call","A prompt regression test"}','{"AI Agents","Production AI"}'),
('ai-agents-path','AI Agents','Design, build and constrain agents that use tools without burning your budget.','Developers comfortable with APIs and structured output.','{"Generative AI in Practice"}',34,'advanced','{"Agent design","Tool use",Guardrails,Tracing}','{"A single-tool agent","A traced multi-step run","A cost and step budget"}','{"Production AI","AI Engineer roadmap"}');

INSERT INTO public.lessons (path_id, slug, title, summary, module_label, estimated_minutes, position)
SELECT p.id, v.slug, v.title, v.summary, v.module, v.mins, v.pos
FROM public.learning_paths p, (VALUES
 ('setup','Mission 01 — Base camp','Install Python, run your first line, and understand what just happened.','Foundations',30,1),
 ('data-types','Mission 02 — Field notes','Strings, numbers, booleans and the errors each one gives you.','Foundations',45,2),
 ('collections','Mission 03 — Supply crates','Lists, dictionaries and choosing the right container.','Foundations',50,3),
 ('control-flow','Mission 04 — Decisions','Conditionals and loops, and how to read them out loud.','Core',45,4),
 ('functions','Mission 05 — Reusable gear','Functions, arguments, returns and why naming matters.','Core',50,5),
 ('files','Mission 06 — Reading the terrain','Files, JSON and handling data that is not perfect.','Core',45,6),
 ('errors','Mission 07 — When things break','Exceptions, tracebacks and debugging without panic.','Core',40,7),
 ('project','Mission 08 — Final expedition','Build a note-summarising script end to end.','Project',90,8)
) AS v(slug,title,summary,module,mins,pos) WHERE p.slug='python-field-manual';

INSERT INTO public.lessons (path_id, slug, title, summary, module_label, estimated_minutes, position)
SELECT p.id, v.slug, v.title, v.summary, v.module, v.mins, v.pos
FROM public.learning_paths p, (VALUES
 ('what-is-a-model','What a model actually is','Weights, training and prediction in plain language.','Understand',35,1),
 ('tokens','Tokens and context','Why models miscount letters and forget conversations.','Understand',30,2),
 ('first-call','Your first model call','From API key to a response you can use.','Build',40,3),
 ('structured','Structured output','Getting JSON you can trust.','Build',40,4),
 ('limits','Limits, cost and safety','Hallucination, bias, cost and where not to use a model.','Judge',35,5)
) AS v(slug,title,summary,module,mins,pos) WHERE p.slug='ai-fundamentals';

-- LESSON BLOCKS (sample interactive lesson content)
INSERT INTO public.content_blocks (owner_type, owner_id, position, type, data)
SELECT 'lesson', l.id, v.pos, v.type, v.data::jsonb
FROM public.lessons l JOIN public.learning_paths p ON p.id=l.path_id AND p.slug='python-field-manual',
(VALUES
 (0,'paragraph','{"text":"Every expedition starts with base camp. Yours is a working Python installation and a file you can run."}'),
 (1,'code','{"language":"python","code":"print(\"Explorer online\")","output":"Explorer online"}'),
 (2,'tip','{"title":"If it errors, read the last line first","text":"Python tracebacks are read bottom-up. The final line names the actual problem."}'),
 (3,'checklist','{"items":["Python installed","An editor open","A file called mission01.py","One line that printed"]}'),
 (4,'quiz','{"question":"What does print() do?","options":["Sends text to a printer","Writes output to the terminal","Saves a file","Starts the program"],"correctIndex":1,"explanation":"print() writes to standard output — your terminal."}')
) AS v(pos,type,data) WHERE l.slug='setup';

-- OPPORTUNITIES
INSERT INTO public.opportunities (slug,title,organization,description,category,location,country,work_mode,eligibility,deadline,difficulty,cost,official_url,source,verified_at) VALUES
('gsoc','Google Summer of Code','Google','A global programme that pays contributors to work on open source with a mentoring organisation.','open-source','Global',NULL,'remote','Open to anyone 18+ new to open source contribution.',current_date+45,'intermediate','free','https://summerofcode.withgoogle.com/','Official site',current_date-6),
('mlh-fellowship','MLH Fellowship','Major League Hacking','A remote internship alternative building open source software in small pods.','fellowship','Global',NULL,'remote','Students and early-career developers worldwide.',current_date+30,'intermediate','free','https://fellowship.mlh.io/','Official site',current_date-6),
('kaggle-playground','Kaggle Playground Competition','Kaggle','Monthly beginner-friendly data science competitions with public leaderboards.','competition','Online',NULL,'remote','Anyone with a Kaggle account.',current_date+12,'beginner','free','https://www.kaggle.com/competitions','Official site',current_date-3),
('hack-the-north','Hack the North','University of Waterloo','One of the largest student hackathons, with travel support for some attendees.','hackathon','Waterloo, Canada','Canada','in-person','Students worldwide; applications reviewed.',current_date+60,'beginner','free','https://hackthenorth.com/','Official site',current_date-8),
('outreachy','Outreachy','Software Freedom Conservancy','Paid remote internships in open source for people subject to under-representation in tech.','internship','Global',NULL,'remote','See the official eligibility criteria; applies worldwide.',current_date+38,'beginner','free','https://www.outreachy.org/','Official site',current_date-4),
('anita-borg-scholarship','Generation Google Scholarship','Google','A scholarship for students in computer science who are active in their communities.','scholarship','Multiple regions',NULL,'hybrid','Undergraduate and graduate students; region-specific criteria.',current_date+25,'beginner','free','https://buildyourfuture.withgoogle.com/scholarships','Official site',current_date-9);

-- RELATIONSHIPS (knowledge graph)
INSERT INTO public.content_relationships (from_type,from_id,to_type,to_id,relation,sort)
SELECT 'article', a.id, v.to_type, x.id, v.relation, v.sort FROM public.articles a
JOIN (VALUES
 ('what-are-ai-agents','roadmap','ai-engineer','learn',1),
 ('what-are-ai-agents','learning_path','ai-agents-path','learn',2),
 ('what-are-ai-agents','resource','langgraph','use',3),
 ('what-are-ai-agents','tool','claude-code','use',4),
 ('what-are-ai-agents','project','ai-research-assistant','build',5),
 ('what-are-ai-agents','article','what-is-rag','understand',6),
 ('what-are-ai-agents','career','ai-engineer','career',7),
 ('what-is-rag','article','how-llms-work','understand',1),
 ('what-is-rag','resource','pgvector','use',2),
 ('what-is-rag','resource','ragas-eval','deeper',3),
 ('what-is-rag','project','rag-assistant','build',4),
 ('what-is-rag','roadmap','ai-engineer','learn',5),
 ('what-is-rag','career','ai-engineer','career',6),
 ('how-llms-work','article','what-is-rag','understand',1),
 ('how-llms-work','learning_path','ai-fundamentals','learn',2),
 ('how-llms-work','resource','huggingface-hub','deeper',3),
 ('how-llms-work','project','ai-chatbot','build',4),
 ('best-ai-coding-tools','tool','cursor','use',1),
 ('best-ai-coding-tools','tool','github-copilot','use',2),
 ('best-ai-coding-tools','resource','github-student-pack','use',3),
 ('best-ai-coding-tools','career','software-engineer','career',4),
 ('how-to-start-learning-ai','learning_path','python-field-manual','learn',1),
 ('how-to-start-learning-ai','resource','automate-boring-stuff','use',2),
 ('how-to-start-learning-ai','resource','cs50p','deeper',3),
 ('how-to-start-learning-ai','project','ai-study-assistant','build',4),
 ('how-to-start-learning-ai','roadmap','ai-automation-builder','learn',5),
 ('how-to-start-learning-ai','career','ai-engineer','career',6),
 ('what-is-mcp','resource','openai-api-docs','use',1),
 ('what-is-mcp','article','what-are-ai-agents','understand',2),
 ('what-is-mcp','project','ai-research-assistant','build',3),
 ('build-your-first-ai-app','resource','openai-api-docs','use',1),
 ('build-your-first-ai-app','resource','fastapi-docs','use',2),
 ('build-your-first-ai-app','project','ai-study-assistant','build',3),
 ('build-your-first-ai-app','learning_path','ai-fundamentals','learn',4)
) AS v(from_slug,to_type,to_slug,relation,sort) ON v.from_slug = a.slug
JOIN LATERAL (
  SELECT id FROM public.articles WHERE v.to_type='article' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.resources WHERE v.to_type='resource' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.tools WHERE v.to_type='tool' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.projects WHERE v.to_type='project' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.roadmaps WHERE v.to_type='roadmap' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.learning_paths WHERE v.to_type='learning_path' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.careers WHERE v.to_type='career' AND slug=v.to_slug
) x ON true;

INSERT INTO public.content_relationships (from_type,from_id,to_type,to_id,relation,sort)
SELECT 'roadmap_node', n.id, v.to_type, x.id, v.relation, v.sort
FROM public.roadmap_nodes n
JOIN public.roadmaps r ON r.id=n.roadmap_id AND r.slug='ai-engineer'
JOIN (VALUES
 ('python','learning_path','python-field-manual','learn',1),
 ('python','resource','automate-boring-stuff','read',2),
 ('python','project','automation-workflow','build',3),
 ('llm-basics','article','how-llms-work','read',1),
 ('llm-basics','learning_path','ai-fundamentals','learn',2),
 ('llm-basics','resource','openai-api-docs','use',3),
 ('generative-ai','learning_path','generative-ai','learn',1),
 ('generative-ai','project','ai-chatbot','build',2),
 ('generative-ai','article','build-your-first-ai-app','read',3),
 ('rag','article','what-is-rag','read',1),
 ('rag','resource','pgvector','use',2),
 ('rag','project','rag-assistant','build',3),
 ('agents','article','what-are-ai-agents','read',1),
 ('agents','learning_path','ai-agents-path','learn',2),
 ('agents','resource','langgraph','use',3),
 ('agents','project','ai-research-assistant','build',4),
 ('production','resource','ragas-eval','use',1),
 ('production','career','ai-engineer','career',2),
 ('systems','resource','fastapi-docs','use',1),
 ('machine-learning','career','ml-engineer','career',1)
) AS v(node_slug,to_type,to_slug,relation,sort) ON v.node_slug = n.slug
JOIN LATERAL (
  SELECT id FROM public.articles WHERE v.to_type='article' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.resources WHERE v.to_type='resource' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.projects WHERE v.to_type='project' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.learning_paths WHERE v.to_type='learning_path' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.careers WHERE v.to_type='career' AND slug=v.to_slug
) x ON true;

INSERT INTO public.content_relationships (from_type,from_id,to_type,to_id,relation,sort)
SELECT 'career', c.id, v.to_type, x.id, v.relation, v.sort FROM public.careers c
JOIN (VALUES
 ('ai-engineer','roadmap','ai-engineer','learn',1),
 ('ai-engineer','project','rag-assistant','build',2),
 ('ai-engineer','project','ai-research-assistant','build',3),
 ('ai-engineer','opportunity','mlh-fellowship','opportunity',4),
 ('ai-engineer','article','what-are-ai-agents','read',5),
 ('software-engineer','roadmap','software-engineer','learn',1),
 ('software-engineer','opportunity','gsoc','opportunity',2),
 ('data-scientist','roadmap','data-scientist','learn',1),
 ('data-scientist','opportunity','kaggle-playground','opportunity',2),
 ('web-developer','roadmap','web-developer','learn',1),
 ('web-developer','project','ai-portfolio-project','build',2),
 ('ml-engineer','roadmap','machine-learning-engineer','learn',1),
 ('cybersecurity-engineer','roadmap','cybersecurity','learn',1)
) AS v(from_slug,to_type,to_slug,relation,sort) ON v.from_slug=c.slug
JOIN LATERAL (
  SELECT id FROM public.roadmaps WHERE v.to_type='roadmap' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.projects WHERE v.to_type='project' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.opportunities WHERE v.to_type='opportunity' AND slug=v.to_slug
  UNION ALL SELECT id FROM public.articles WHERE v.to_type='article' AND slug=v.to_slug
) x ON true;