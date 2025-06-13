import fs from "fs"
import xml2js from "xml2js"

function cleanAmount(text) {
  return Number.parseInt(text.replace(/[^\d]/g, ""), 10)
}

function parseBody(body) {
  const lower = body.toLowerCase()
  let type = "other"

  if (lower.includes("withdrawn")) type = "withdrawal"
  else if (lower.includes("payment")) type = "payment"
  else if (lower.includes("deposit")) type = "deposit"
  else if (lower.includes("transferred")) type = "transfer"
  else if (lower.includes("bundle")) type = "bundle"

  const amountMatch = body.match(/([0-9,]+) RWF/)
  const amount = amountMatch ? cleanAmount(amountMatch[1]) : 0

  const dateMatch = body.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
  const date = dateMatch ? dateMatch[0] : null

  return { body, type, amount, date }
}

async function parseXMLFile(filepath) {
  const xml = fs.readFileSync(filepath, "utf-8")
  const result = await xml2js.parseStringPromise(xml)

  // confirm it's <smses><sms ... /></smses>
  const messages = result.smses.sms
  return messages.map((s) => parseBody(s.$.body)) // `s.$.body` is the body attribute
}

export default parseXMLFile // Use default export
