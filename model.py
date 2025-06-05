from google import genai
from google.genai import types
import base64
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "capstone-20841-f6ef42f0b504.json"

def generate():
  client = genai.Client(
      vertexai=True,
      project="capstone-20841",
      location="global",
  )

  msg2_text1 = types.Part.from_text(text="""**Analyzing \"What\"**

I've started by breaking down the core task: understanding the implications of the word \"what.\" My initial assessment, as you can see, focused on its function and inherent ambiguity. It seems crucial to recognize that \"what\" is a question opener that demands more context, an opening question with many possible follow ups, in order to provide a meaningful response.""")
  msg2_text2 = types.Part.from_text(text="""**Deciphering Contextual Meaning**

I'm currently refining the approach to handle \"what\" within an AI context. I've expanded the list of potential interpretations, emphasizing the need for clarification. My priority is now formulating the most effective conversational prompts to elicit further information from the user, and how to steer the conversation back on course if needed.""")
  msg2_text3 = types.Part.from_text(text="""**Crafting a Response**

I've moved from analysis to implementation, drafting and refining a response framework. The goal is a helpful and polite answer to the ambiguous \"what.\" I'm now focusing on delivering options to address common user needs and conversational context.""")
  msg2_text4 = types.Part.from_text(text="""**Simplifying and Refining**

I'm now focusing on the final wording of the \"what\" response. After several iterations, I'm working to balance directness, helpfulness, and brevity. The options have been reduced and refined, and the goal is to create a template that covers various user intentions while sounding natural.""")
  msg2_text5 = types.Part.from_text(text="""**Formulating the Final Answer**

Now, I've finalized the chosen response: \"What about 'what'? Can you please provide more context or tell me what specifically you'd like to know?\" I opted for this version for its directness, clarity, and politeness. I feel it strikes a good balance between acknowledging the vagueness and prompting the user for the necessary information to provide a relevant answer.""")
  msg2_text6 = types.Part.from_text(text="""What about \"what\"?

To give you a helpful answer, please tell me:
*   What are you referring to?
*   What do you want to know?
*   What did I say that you're questioning?""")

  model = "gemini-2.5-flash-preview-05-20"
  contents = [
    types.Content(
      role="user",
      parts=[
        types.Part.from_text(text="""what""")
      ]
    ),
    types.Content(
      role="model",
      parts=[
        msg2_text1,
        msg2_text2,
        msg2_text3,
        msg2_text4,
        msg2_text5,
        msg2_text6
      ]
    ),
    types.Content(
      role="user",
      parts=[
        types.Part.from_text(text="""wisata yogyakarta""")
      ]
    ),
  ]

  generate_content_config = types.GenerateContentConfig(
    temperature = 1,
    top_p = 1,
    seed = 0,
    max_output_tokens = 65535,
    safety_settings = [types.SafetySetting(
      category="HARM_CATEGORY_HATE_SPEECH",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold="OFF"
    ),types.SafetySetting(
      category="HARM_CATEGORY_HARASSMENT",
      threshold="OFF"
    )],
  )

  for chunk in client.models.generate_content_stream(
    model = model,
    contents = contents,
    config = generate_content_config,
    ):
    print(chunk.text, end="")

generate()