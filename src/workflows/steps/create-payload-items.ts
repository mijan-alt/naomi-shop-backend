import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PayloadUpsertData } from "../../modules/payload/types"
import { PAYLOAD_MODULE } from "../../modules/payload"
import PayloadModuleService from "../../modules/payload/service"



type StepInput = {
  collection: string
  items: PayloadUpsertData[]
}

export const createPayloadItemsStep = createStep(
  "create-payload-items",
  async ({ items, collection }: StepInput, { container }) => {
       const payloadModuleService = container.resolve<PayloadModuleService>(PAYLOAD_MODULE)
    
    const createdItems = await Promise.all(
      items.map(async (item) => await payloadModuleService.create(
        collection,
        item
      ))
    )

    return new StepResponse({
      items: createdItems.map((item) => item.doc),
    }, {
      ids: createdItems.map((item) => item.doc.id),
      collection,
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const { ids, collection } = data

   const payloadModuleService = container.resolve<PayloadModuleService>(PAYLOAD_MODULE)

    await payloadModuleService.delete(
      collection,
      {
        where: {
          id: {
            in: ids.join(","),
          },
        },
      }
    )
  }
)