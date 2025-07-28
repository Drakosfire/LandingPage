
{
    id: #,
    title: '',
    snippet: '',
    content:''
}
# A Rules Lawyer for every table!

## *Accurately answering questions faster!*

---

### **What is a Rules Lawyer?**

It’s a good question, what is a Rules Lawyer, why would you want one? I’m betting I can show you that you didn’t know how much a Rules Lawyer could help you. A “Rules Lawyer” is a sometimes derogatory, sometimes complementary, and in my opinion always useful person to have around. In the Table Top Roleplaying Game community, these are folk who actually read the rules! They loved reading the dense textbook like tomes that are many game rules, and serve as the adjudicator of wonderful and ridiculous ideas. This problem I am solving is what if you don’t have a rules lawyer? 

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

**Example of Success :**

![Example of success :](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/a4db13f0-ce5c-44ce-ffc0-0a91e97cbf00/public)

**Example of Partial Success :**

![Example of partial success : ](https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/7d104b09-7ec5-42bd-f231-d638300be000/blogpost)

**Ground Truth :**

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


