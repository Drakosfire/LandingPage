import { BlogPost } from './types';

export const posts: BlogPost[] = [
  {
    id: 1,
    title: 'Here There Be Stories',
    snippet: `Welcome to DungeonMind!
        Discover the magic of storytelling and technology with me, Alan Meigs. I'm a storyteller, builder, and tech enthusiast creating tools that make TTRPG world-building easier and more accessible. Dive into custom tools like the Store Generator, explore AI-powered creations, or follow my journey blending creativity and cutting-edge tech. Ready to create your next adventure? Let’s build something amazing together!`,
    content: `
#### *Nice to meet’cha, I’m Alan*
  \n  &nbsp;
---

### **Building Worlds and Telling Stories**
  \n  &nbsp;

---

Come on in, don’t be shy—the fire is warm, the cider is spiced and hot, and in this tavern, we tell stories. I’ll start with mine, and maybe it’ll inspire you to share yours. I’m a storyteller, builder, problem solver, and leader—a huge nerd with a passion for technology. From my earliest memories of our NES (Nintendo Entertainment System) and an IBM clone PC to my enduring love of Virtual Reality and Generative AI, I’ve always been captivated by the intersection of creativity and tech.  

This post is my introduction—how I went from being intimidated at running a TTRPG game to hosting long-term campaigns, from my “Hello World” in Python to configuring NGINX files to host a static webpage on a VPS. My mission is to create tools that make storytelling and creativity easier and more accessible for everyone.  
  \n  &nbsp;

### **Becoming a Storyteller**
  \n  &nbsp;

---

You can blame all of this on my 13th birthday party—that first roll of a d20, the thrill of telling the Game Master exactly what my character was going to do, unrestricted by the limitations of a video game. That moment changed my world.  

I never finished that game, nor did I have much success playing in campaigns for years. But eventually, I realized my biggest challenge: I didn’t want to be a character—I wanted to *be the world*. I wanted to onboard new players with flexible worlds and stories that adapted to their characters.  

And so, I began creating: a kingdom, a world, a cosmology, and a deep history loosely built on the Dungeons & Dragons framework, yet distinctly my own. That game ran for over a year, and it proved something to me: I could gather people, teach them, engage them, and tell stories that lived in their hearts and minds as much as in my own. Along the way, I learned to leverage existing resources, when to create my own, and how to stay flexible enough to let my players craft their own stories.
  \n &nbsp;

### **Learning to Build with Generative AI**
  \n  &nbsp;

---

> That’s all good and well for storytelling, but where does technology come in?  

In June 2023, storytellers in my community started experimenting with early AI image generators to create art for their games. Tools like MidJourney were intriguing, but their results were often underwhelming. Tinkerer that I am, I dove into the world of **Stable Diffusion** and began running it locally.  

![One of my first images locally generated—a cologne bottle inspired by the Diablo games.](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/4802fcaf-f20c-466b-b8ff-448e4ae04500/blogpost)

*One of my first images locally generated—a cologne bottle inspired by the Diablo games.*  \n  &nbsp;
  
From there, the dominoes started falling. I learned to train my own **LoRAs** (Low-Rank Adaptations) using custom datasets, a concept rooted in machine learning research ([tutorial](https://stable-diffusion-art.com/train-lora/)). Suddenly, I could generate custom images from text descriptions with minimal effort.  \n  &nbsp;

Then I thought: *Could the AI write better prompts for image generation than I could?* It could. *Could it write a monster stat block?* Absolutely—though it needed some editing. Soon, I wanted to combine all these elements into cohesive, polished outputs that looked like published materials.  *Huge thank you to the homebrewery.com open source project.*[https://homebrewery.naturalcrit.com/](https://homebrewery.naturalcrit.com/)  \n  &nbsp;

This led to a six-month obsession and my first major project: a tool that generates custom HTML resembling a professionally published PDF. It was clunky, slow to start, and unnecessarily containerized—but it worked. More importantly, it freed me to focus on the creative aspects of TTRPG design rather than tedious formatting. I was hooked.

![“It’s not perfect, but it accomplishes my core goals.”](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/03041be4-0bca-4e19-8919-87d463520300/public)
*10/28/23 - “It’s not perfect, but it accomplishes my core goals.”*
  \n  &nbsp;

### **Learning & Building**
  \n  &nbsp;

---
Fast forward a year, and I’ve expanded my skill set to include Python, APIs, JavaScript, web hosting, server configuration, static sessions, and leveraging CDNs (Content Delivery Networks). Soon, I’ll be integrating remote database storage as well.  

The result? This very website—my personal platform hosted on a VPS through Hostinger.com under my own domain name, DungeonMind.net. It’s a bucket-list achievement that serves as the foundation for everything else I create, with a blog to document the journey.  

Here’s what’s live and what’s coming soon:  

- **Store Generator**: Already up and running, this tool lets you create stores, employees, inventories, and dynamically rearrange each block of HTML. With a login, you can save your creations to revisit later.  
- **Rules Lawyer**: My next project to bring back online, providing accessible, in-context rule guidance for TTRPGs.  
- **Card Generator and Statblock Generator**: These tools will simplify creating TTRPG assets, from item cards to detailed monster stats.  
- **One-Shot Story Generator** *(coming soon)*: A start-to-finish adventure generator that creates image assets, NPC and monster stat blocks, stores, and custom loot in a publish-ready format—all from minimal text input.  

![Custom item and card back I created—later I’ll write about how I manufacture these into physical cards.](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/33fb476f-643d-4850-9830-6bc7a5695700/blogpost)
\n  &nbsp;

*Custom item and card back I created—later I’ll write about how I manufacture these into physical cards.*  \n  &nbsp;

### **We’re Going on an Adventure!**
  \n  &nbsp;

---

I’m only just getting started. There’s so much more to learn, stories to tell, and projects to share. This space is for storytellers, technologists, futurists—and, I hope, *you*.  
  \n  &nbsp;

### **What’s Next?**
  \n  &nbsp;

---

Keep an eye out for future posts and updates. Until then:  
- **Explore my tools**: Try out the [Store Generator](https://dungeonmind.net/storegenerator).  
- **Check out my other projects**: [Hugging Face](https://huggingface.co/), [LinkedIn](https://linkedin.com/in/yourprofile).  
- **Get in touch**: Email me at dungeon.mind.am@gmail.com or commission custom adventures, items, or stat blocks.  
- **Collaborate**: Have a project idea? I’m always looking to get involved.  

Let’s build something amazing together.

---
`,
  },
  {
    id: 2,
    title: 'A Rules Lawyer for every table!',
    snippet: 'A “Rules Lawyer” is a sometimes derogatory, sometimes complementary, and in my opinion always useful person to have around. In the Table Top Roleplaying Game community, these are folk who actually read the rules!',
    content: `
    
  ## *Accurately answering questions faster!*
  
  ---
  
  ### **What is a Rules Lawyer?**
  
  What is a Rules Lawyer and why would you want one to build one? A “Rules Lawyer” is a sometimes derogatory, sometimes complementary, and in my opinion always useful person to have around. In the Table Top Roleplaying Game community, these are folk who actually read the rules! They loved reading the dense textbook like tomes that are many game rules, and serve as the adjudicator of wonderful and ridiculous ideas. This problem I am solving is what if you don’t have a rules lawyer? 
  
  What if you want to play the game instead of cramming like you skipped every class before an exam? What if you don’t want to read, reread, notate, and keep a diary of all the rules of the game? Well go ask the Rules Lawyer. This is a tool with multiple different rule sets that have been parsed, chunked, had meta data appended, and are ready to be queried. This is what is known as “Retrieval Augmented Generation” or in other words, you can chat with your rule set, and I’m going to provide you with an accurate answer to your rule question and a page to reference.
   
  ---
  
  ### **What problem does that solve?**
  
  Humble brag, I’ve read the Dungeon Master’s Guide and Player’s Handbook cover to cover. I don’t expect anyone else to, good stuff though. Having onboarded almost a dozen new players over the years. I’m confident that if I told them “step one is just read this textbook” I would have a textbook thrown at me, and rightly so. Also I would have onboarded exactly 0 new players. 
  
  So instead, after I feel in love with generative AI, and my imagination went spinning out of control, one very functional place it landed and focused on was Rules Lawyer. My table rule is whenever a question comes up about the rules, if we aren’t sure of the answer we ask the Rules Lawyer and accept that answer, then look it up later. This stops debates before it derails the game, embraces saying “yes” to player ideas and we keep playing. Happy player, happy DM, and happy table of players who are not staring at their phones and laptops waiting for us to settle the question for the 10th time about how grapple works.
  
  ---
  
  ### **That sounds pretty good, how did you build it?**
  
  I was motivated to learn how I could parse PDFs, which are a notorious pain and generally awful format except for the ways in which they are exceptional. I experimented with several different open source and paid tools with moderate success. I finally settled on docling an open source project by IBM. This tool is able to parse a pdf with very low error,and most importantly keep tables intact, as well as generate a ton of useful and interesting metadata such as page number, heading information, and coordinates for images. Once I had a functional tool that could handle (so far) any PDF of whatever quality I threw at it, looking at you ancient scans of old rules, I was ready for the real work, do something with all that data.
  
  So we go from PDF to JSON, with tons of data. Then summarize each page by passing the text to an LLM and store that page summary as additional metadata. Create a document summary by passing all of the summaries. Then create a paginated markdown file of the entire document. Chunk it into large pieces. Create embeddings of the entire document. Put the embeddings, page number, summary, and embeddings back together into a database cough csv cough, and build a chatbot with instructions to cite the pages referenced. The RAG implementation right now is very standard, get the embeddings of the user query, top 5 nearest neighbors of that vector, pass those to the LLM with the query and a fairly simple system prompt. 
  
  ---
  
  ### **Does it really work? What else could you use it for?**
  
  It really really does. Generative AI isn’t magic, it is super cool statistics! Which is part of what I love about it, statistics was one of the only classes I paid full attention to, thanks Mr. Richardson! 
  
  Go try it out, if you have one of the texts handy that I am using, you can fact check. If it performs badly, please let me know. My current data shows a high success rate, which can’t be right! 
  
  Example of Success:
  
  ![Example of success :](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/a4db13f0-ce5c-44ce-ffc0-0a91e97cbf00/public)
  
  Example of Partial Success:
  
  ![Example of partial success : ](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/7d104b09-7ec5-42bd-f231-d638300be000/blogpost)
  
  Ground Truth:
  
  ![Page 369 : ](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/f7d89499-9c02-4b43-6571-f0aac2f68200/public)
  
  I’m calling it a partial success because it is a good answer, but the citation shows the weakness of semantic search. IE that is the page for halflings, which I’m certain the logs show was pulled. This is a solvable problem with a more advanced search structure than I’ve built yet.
  
  
  
  ---
  
  ### **Ugh, I can barely match Google’s Search**
  
  I’m paraphrasing a conversation with another engineer I chatted with about Retrieval Augmented Generation techniques. I was blown away when in whole hearted honesty, this person correctly assessed their home built search as basically matching google search over wikipedia. That is the exciting frontier world we are playing in, at your fingertips are world class tools. While it’s an exaggeration to compare homebrewed tooling to the Google Algorithm, it’s not an exaggeration to think the next world class tools are being homebrewed by tinkerers right now. I am able to parse and embed an entire textbook worth of information and provide it to you in a friendly chatbot form for almost 0 cost, that is mind blowing.
  
  ---
  
  ### **What’s Next?**
  
  It’s sometime kinda slow, I’d like to better understand why that is and work on optimization.
  More metadata! I know how to access the headings and can figure out chapters, I intend to have those added to the context and the embedding file.
  Properly store the data in a database 
  Build out hybrid search and reranking
  Generate custom metadata during the parsing
  Experiment with HYDE or Hypothetical Document Embeddings
  
  ---
  
  
  `

  }

  // Add more blog posts as needed
];

