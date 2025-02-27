const host: string = 'localhost:9999'

export const apiAddress = (url: string) => `http://${host}${url}`
export const wsAddress = (url: string) => `ws://${host}${url}`

export const objectNames = async () => {
  return await fetch(apiAddress('/object_names')).then(async (res) => await res.json())
}

export const updateDisplay = async (object_name: string, prob: number) => {
  return await fetch(apiAddress(`/update_display?object_name=${object_name}&prob=${prob}`)).then(async (res) => await res.json())
}

export const currentObjectName = async () => {
  return await fetch(apiAddress(`/current_object_name`)).then(async (res) => await res.json())
}

export const vectors = async (object_name: string) => {
  return await fetch(apiAddress(`/vectors?object_name=${object_name}`)).then(async (res) => await res.json())
}

export const knowledgeGraph = async (object_name: string) => {
  return await fetch(apiAddress(`/knowledge_graph?object_name=${object_name}`)).then(async (res) => await res.json())
}

export const knowledgeGraphEx = async (object_name: string) => {
  return await fetch(apiAddress(`/knowledge_graph_ex?object_name=${object_name}`)).then(async (res) => await res.json())
}

export const pictures = async (object_name: string) => {
  return await fetch(apiAddress(`/pictures?object_name=${object_name}`)).then(async (res) => await res.json())
}
