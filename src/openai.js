// import { Configuration, OpenAIApi } from "openai";
// const configuration = new Configuration({
//   organization: "org-L54T8evqRXzJVYIdfeXIReqd",
//   apiKey: "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",
// });
// const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
const response = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: "Say this is a test",
  temperature: 0,
  max_tokens: 7,
});
