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

    // Add more blog posts as needed
]; 