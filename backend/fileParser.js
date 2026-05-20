import pdf from 'pdf-parse'

export async function extractTextFromFile(file) {
  const { mimetype, buffer } = file
  if (mimetype === 'application/pdf') {
    const data = await pdf(buffer)
    return data.text
  }
  return buffer.toString('utf-8')
}
