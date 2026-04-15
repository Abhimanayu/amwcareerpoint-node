require("dotenv").config();
const mongoose = require("mongoose");
const { Blog, BlogCategory } = require("../models/Blog");
const slugify = require("slugify");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

const generatePaddedText = (length) => {
  if (length <= 0) return "";
  let text = "StressTest ";
  const charBlock = "UIBreakTest";
  while (text.length < length) {
    if (text.length % 150 === 0) {
      text += "Supercalifragilisticexpialidocious_UnbreakableWordTest_" + charBlock;
    } else {
      text += "Lorem ipsum dolor sit amet consectetur adipiscing elit. ";
    }
  }
  return text.substring(0, length).trim();
};

const extremeEdgeCaseHTML = `
<h2>Edge Case 1: Extremely Long Unbreakable Wrapper Testing</h2>
<p>This paragraph contains a standard explanation followed by an extremely long rigid string that typically blows out layouts lacking <code>word-break: break-word</code> or <code>overflow-wrap: anywhere</code>.</p>
<p>Here it is: Supercalifragilisticexpialidocious_UnbreakableWordTest_Extra_Supercalifragilisticexpialidocious_UnbreakableWordTest_Extra_Supercalifragilisticexpialidocious_UnbreakableWordTest</p>

<h2>Edge Case 2: Deeply Nested and Extremely Long Lists</h2>
<ul>
  <li>Standard list item</li>
  <li>List item containing a very long word: UnbreakableWordTest_Supercalifragilisticexpialidocious_ExtraExtrz</li>
  <li>Nested List
    <ol>
      <li>First nested item.</li>
      <li>Second nested with huge text: ${generatePaddedText(500)}</li>
      <li>Nested inside nested
         <ul>
           <li>Deeply nested</li>
           <li>Deeply nested long word testingttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</li>
         </ul>
      </li>
    </ol>
  </li>
</ul>

<h2>Edge Case 3: Wide Table (Horizontal Overflow)</h2>
<p>Tables are notorious for breaking mobile layouts. This table has many columns and long unbroken headers.</p>
<div class="table-responsive">
  <table border="1" style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="padding: 8px;">Column 1</th>
        <th style="padding: 8px;">Column 2 (Long Header Testingtttttttttttttttttttttttttttttttttttttttt)</th>
        <th style="padding: 8px;">Column 3</th>
        <th style="padding: 8px;">Column 4</th>
        <th style="padding: 8px;">Column 5</th>
        <th style="padding: 8px;">Column 6</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 8px;">Data 1</td>
        <td style="padding: 8px;">Data 2 with a lot of text here to see how it squishes the other columns or if it causes the table to break out of the container bounds. ${generatePaddedText(100)}</td>
        <td style="padding: 8px;">Data 3</td>
        <td style="padding: 8px;">Data 4 Unbreakableeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeez</td>
        <td style="padding: 8px;">Data 5</td>
        <td style="padding: 8px;">Data 6</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Edge Case 4: Multiple Images Testing</h2>
<p>Image without constrained dimensions (should resize properly within container max-width: 100%):</p>
<img src="https://via.placeholder.com/1200x800" alt="Super large placeholder image" style="max-width: 100%; height: auto;" />

<p>Image floated left with text wrap around it:</p>
<img src="https://via.placeholder.com/300" alt="Small floated image" style="float: left; margin: 0 15px 15px 0;" />
<p>${generatePaddedText(800)}</p>
<div style="clear: both;"></div>

<p>Inline images embedded in text <img src="https://via.placeholder.com/50x50" alt="icon" style="vertical-align: middle;"> to check vertical alignment.</p>

<h2>Edge Case 5: Code Block (Horizontal Scrollbar Testing)</h2>
<pre style="background: #f4f4f4; padding: 15px; overflow-x: auto;">
<code>
function reallyLongFunctionNameWhichShouldProbablyBeRefactoredButWeAreTestingThings() {
  const variableOne = "This is a really long string literal that should not wrap inside a preformatted code block so that we can test if the pre block has a horizontal scrollbar or if it breaks the layout.";
  return variableOne;
}
</code>
</pre>

<h2>Edge Case 6: Blockquote with Citation</h2>
<blockquote style="border-left: 5px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
  <p>${generatePaddedText(400)}</p>
  <cite>— A Very Long Author Name Testingtttttttttttttttttttttttttttttttttttttttttttt</cite>
</blockquote>

<h2>Edge Case 7: Headings Hierarchy</h2>
<h3>H3 Subheading</h3>
<p>Test text.</p>
<h4>H4 Subheading</h4>
<p>Test text.</p>
<h5>H5 Subheading</h5>
<p>Test text.</p>
<h6>H6 Subheading</h6>
<p>Test text.</p>

<hr style="margin: 30px 0;" />
<p>Final paragraph testing separation with hr.</p>
`;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  console.log("🛠️ Creating a Stress Test Category...");
  const catSlug = slugify("Extreme UI Edge Cases", { lower: true });
  let category = await BlogCategory.findOne({ name: "Extreme UI Edge Cases" });
  if (!category) {
    category = await BlogCategory.create({ name: "Extreme UI Edge Cases" });
  }

  console.log("🛠️ Seeding 10 MAXIMUM LENGTH Blogs with Edge Cases...");

  for (let i = 1; i <= 10; i++) {
    const slug = slugify(`max-test-blog-${i}-${Date.now()}`, { lower: true });
    
    // Combining the raw extreme layout HTML with random padding to further bloat it
    const finalContent = extremeEdgeCaseHTML + `<p>${generatePaddedText(2000)}</p>`;

    await Blog.create({
      title: `MAX TEST Blog Extravaganza ${i}: ${generatePaddedText(100)}`,
      slug: slug,
      category: category._id,
      content: finalContent,
      excerpt: generatePaddedText(400),
      coverImage: "https://via.placeholder.com/1200x630.png?text=Max+Test+Cover",
      author: `Chief Tester ${generatePaddedText(50)}`,
      tags: [
        `tag${i}`, 
        "unbreakableTagTestingTrrrrrrrrrryyyyyyYyyy", 
        "responsive design",
        "mobile first",
        "extreme overflow testing tag with spaces",
        "short",
        "tag"
      ],
      status: "published",
      featured: true,
      seo: {
        metaTitle: generatePaddedText(60),
        metaDescription: generatePaddedText(160),
        keywords: "test, blog, overflow, css, ui, break, layout, tables, images, long string"
      }
    });
  }

  console.log("✅ 10 Extreme Edge-Case Blogs explicitly loaded.");
  console.log("✅ Check them on the frontend to verify tables, images, pre blocks, and long unbroken words!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
