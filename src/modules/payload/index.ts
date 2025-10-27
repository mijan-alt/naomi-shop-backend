import { Module } from "@medusajs/utils"


import PayloadModuleService from "./service"

export const PAYLOAD_MODULE = "payload"

export default Module(PAYLOAD_MODULE, {
  service: PayloadModuleService,
})