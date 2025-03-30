# Ideas

*   This document captures possible future feature implementations. It is simply a "brainstorming" type document to capture thoughts. Do not make edits to this document unless asking first and if approved, only append to the existing doc and update a revision table at the top of the document.

## Content Taxonomy

*   Use something like one of the below systems to define a finite list of "tags" or documentation classifications 
    *   [Simple Knowledge Organization System](https://en.wikipedia.org/wiki/Simple_Knowledge_Organization_System) 
    *   [Information Coding Classification](https://en.wikipedia.org/wiki/Information_Coding_Classification) 
    *   [Universal Decimal Classification (UDC)](https://en.wikipedia.org/wiki/Universal_Decimal_Classification)
*   Have a LLM automatically tag (or score? --> instead of a simple yes/no, possibly have the LLM give the content item a "score" for each tag/classification) the values for a given article using a well pre-defined prompt template and/or system prompt.
*   Allow a user to modify these values per content item and/or in batch
*   Somehow visually expose these data points to the user (like Obisdian graphs?) with the purpose of highlighting "connections" between content items and the user's "interest" in each tag/classification
*   Also possible allow the user to set preferences or "dials" for each tag/classification. These preferences could then be used to possibly rate/grade/rank each content item based on the user's potential "liking" of the content item - i.e., if I "dial" my "physics" dial to "10" (on a scale of 10), then content items with a high "physics score" should show up more frequently / get a higher rating/ranking

## Content Types

*   YouTube videos / transcripts
*   "Hand written" notes via markdown editor or "friendly" copy/paste
    *   Possibly branch off the "add content" button 1) Add URL, 2) Create Content?  Maybe better as two different options?

# Wikipedia Category Graph for Taxonomy

Based on your specific criteria—**broad coverage**, **ease of automated tagging by small models**, and suitability for virtually **any topic an individual might want to explore further**—I strongly recommend using the **Wikipedia Category Graph (DBpedia/Wikipedia Categories)** as your foundational taxonomy.

---

## 🌟 **Why Wikipedia Category Graph?**

### 1\. **Broad, Comprehensive Coverage**

*   Wikipedia is arguably the largest, most extensive, and continuously updated knowledge taxonomy available publicly.
*   Covers virtually **every conceivable topic**: culture, technology, history, entertainment, science, politics, arts, niche interests, etc.

### 2\. **Friendly to Small Language Models (SLMs)**

*   Categories are naturally named using plain language, making them **easily interpretable and assignable by smaller LLM/SLM models** without extensive fine-tuning.
*   Intuitive hierarchical structure makes it easy for a model to select broad or narrow labels based on content understanding.

### 3\. **Rich, Clear Definitions & Relationships**

*   Each Wikipedia category is self-descriptive, and the relationships (broader/narrower categories) help models accurately classify even ambiguous content.
*   Definitions can be automatically extracted from associated article summaries, which improves classification accuracy.

### 4\. **Constantly Updated & Community-Driven**

*   Benefits from Wikipedia’s **constant updating** and **crowd-sourced improvements**, ensuring relevance and adaptability as your application grows.

---

## 📚 **Example Categories from Wikipedia Category Graph**

| Broad Category | Narrower Example Categories |
| --- | --- |
| **Technology** | Artificial Intelligence, Robotics, Quantum Computing |
| **Science** | Biology, Astrophysics, Chemistry, Ecology |
| **History** | Medieval Europe, World War II, Ancient Civilizations |
| **Entertainment** | Films, Video Games, Music Genres |
| **Lifestyle & Culture** | Cooking, Personal Development, Fashion, Travel |
| **Education & Learning** | Study Skills, Higher Education, Online Learning |
| **Health & Medicine** | Nutrition, Mental Health, Medical Technology |
| **Business & Economics** | Entrepreneurship, Finance, Marketing |
| **Social & Politics** | Environmental Issues, Human Rights, Public Policy |
| **Arts & Humanities** | Literature, Philosophy, Visual Arts |

---

## 🛠️ **How to practically implement this:**

### **Step 1:**

Extract or download a clean version of the Wikipedia category graph through DBpedia:

*   **DBpedia Categories**:
    *   [DBpedia Category Data Set](https://www.dbpedia.org/resources/category/)
    *   Alternatively, leverage [DBpedia SPARQL endpoint](https://dbpedia.org/sparql) to dynamically explore and export categories.

### **Step 2:**

Convert this to a simplified SKOS (Simple Knowledge Organization System) format:

Example SKOS concept structure:

```
{
  "id": "https://dbpedia.org/resource/Category:Machine_learning",
  "prefLabel": "Machine Learning",
  "definition": "Machine learning (ML) is a subfield of artificial intelligence concerned with algorithms that improve automatically through experience.",
  "broader": ["https://dbpedia.org/resource/Category:Artificial_intelligence"],
  "narrower": ["https://dbpedia.org/resource/Category:Deep_learning"],
  "altLabel": ["ML", "Statistical learning"]
}
```

### **Step 3:**

Use prompts with your SLM or LLM like:

> "Given this content, select the most relevant Wikipedia categories from this predefined list, each with a definition. Select between 1–5 categories that best represent the main focus areas."

---

## 🚀 **Final Recommendation:**

The Wikipedia Category Graph via DBpedia is **the most practical, accessible, and versatile taxonomy** for your scenario, offering the **optimal balance between breadth of coverage** and ease of **automated categorization by smaller language models**.

Would you like help with setting up an initial SKOS-formatted Wikipedia category subset or guidance on creating prompts optimized for your model?