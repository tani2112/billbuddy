from typing import Dict, Any

def build_listing_system_prompt() -> str:
    return """You are SellCraft AI, an elite e-commerce copywriter, conversion rate optimization (CRO) specialist, and marketplace SEO expert.
Your job is to generate high-converting, professional product listings tailored for small businesses, Instagram sellers, resellers, and boutique brands.

You MUST respond strictly with a valid JSON object matching the requested schema. Do NOT include markdown code fences (like ```json), commentary, or explanations outside the JSON object.

Output schema:
{
  "seo_title": "Primary SEO-optimized title (clean, keyword-rich, within 60-80 chars)",
  "description": "Engaging, structured product description with an emotional hook, product story, features breakdown, and usage scenario. Formatted with natural paragraph breaks.",
  "selling_points": [
    "First major benefit/feature (concise & compelling)",
    "Second major benefit/feature",
    "Third major benefit/feature",
    "Fourth major benefit/feature",
    "Fifth major benefit/feature"
  ],
  "keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3",
    "keyword 4",
    "keyword 5",
    "keyword 6",
    "keyword 7",
    "keyword 8",
    "keyword 9",
    "keyword 10"
  ],
  "instagram_caption": "Write an actual complete, compelling, ready-to-post Instagram caption (NEVER output placeholder text). Must include an eye-catching first-line hook, engaging storytelling, friendly emojis, line breaks, call-to-action, and 15-20 relevant hashtags (#tag).",
  "call_to_action": "A single compelling, urgent closing sentence prompting immediate purchase or DM.",
  "alternative_titles": [
    "Short & punchy alternative title",
    "Feature-dense keyword alternative title",
    "Luxury / lifestyle appeal alternative title"
  ]
}
"""

def build_listing_user_prompt(
    product_name: str,
    category: str,
    features_specs: str,
    target_audience: str,
    platform: str,
    tone: str,
    language: str,
    image_hints: str = ""
) -> str:
    audience_text = target_audience.strip() if target_audience else "General modern shoppers looking for quality and value"
    
    platform_guidelines = {
        "Instagram": "Focus on high visual appeal, aesthetic lifestyle hook, engaging conversational vibe, line breaks, emojis, and viral/niche hashtags.",
        "Etsy": "Emphasize craftsmanship, unique handmade or artisanal charm, thoughtful giftability, material authenticity, and Etsy-friendly tags.",
        "eBay": "Emphasize exact specifications, condition clarity, dimensions, durability, buyer value, and high-searchability technical keywords.",
        "Shopify": "Focus on brand storytelling, premium trust-building, clear customer benefits, structured specifications, and a frictionless buy CTA.",
        "Amazon": "Use benefit-driven bullet points formatted as [FEATURE HIGHLIGHT]: Explanation. Keyword-dense SEO title without fluff.",
        "General": "Versatile, well-structured product page copy suitable for any direct-to-consumer store or catalog."
    }.get(platform, "Versatile, high-converting product listing.")

    tone_guidelines = {
        "professional": "Authoritative, polished, clear, fact-backed, and trustworthy.",
        "friendly": "Warm, accessible, welcoming, like a trusted friend sharing a great find.",
        "premium": "Sophisticated, exclusive, emphasizing craftsmanship, elegance, and distinction.",
        "persuasive": "Urgent, benefit-forward, highlighting problem-solving, value, and why to buy now.",
        "playful": "Witty, lively, energetic, fun, and memorable."
    }.get(tone.lower(), "Persuasive and engaging.")

    language_instruction = {
        "English": "Write entirely in natural, fluent English.",
        "Hindi": "Write in natural, culturally resonant Hindi (in Devanagari script for titles/descriptions, with popular shopping terminology).",
        "Hinglish": "Write in modern Indian Hinglish (blend of conversational Hindi written in Roman English script + fluent English), ideal for Instagram DM sellers and D2C brands in India."
    }.get(language, "Write in clear English.")

    image_context = f"\nObserved Visual Details from Product Image:\n{image_hints}\n" if image_hints else ""

    return f"""Please generate a complete product listing with the following specifications:

- Product Name: {product_name}
- Category: {category}
- Features & Specifications: {features_specs}
- Target Audience: {audience_text}
- Target Platform: {platform} (Guideline: {platform_guidelines})
- Desired Tone: {tone} (Guideline: {tone_guidelines})
- Language: {language} ({language_instruction})
{image_context}
Generate exactly 5 key selling points, at least 10 relevant search keywords, an Instagram caption with hashtags, a strong call-to-action sentence, and 3 distinct alternative titles. Output strictly valid JSON."""
