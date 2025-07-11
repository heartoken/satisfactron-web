// Types for frontend components
export type Device = {
  id: string
  name: string
  votes: Vote[]
}

export type Vote = {
  id: string
  value: number
  device: Device
}
