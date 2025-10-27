import { createWorkflow, transform, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { PayloadCollectionItem, PayloadUpsertData } from "../modules/payload/types"
import { updatePayloadItemsStep } from "./steps/update-payload-items"

type WorkflowInput = {
  variant_ids: string[]; 
}

export const createPayloadProductVariantWorkflow = createWorkflow(
  "create-payload-product-variant",
  ({ variant_ids }: WorkflowInput) => {
    const { data: productVariants } = useQueryGraphStep({
      entity: "product_variant",
      fields: [
        "id",
        "title",
        "options.*",
        "options.option.*",
        "product.payload_product.*",
      ],
      filters: {
        id: variant_ids,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const updateData = transform({
      productVariants,
    }, (data) => {
      const items: Record<string, PayloadUpsertData> = {}

      data.productVariants.forEach((variant) => {
   
      const payloadProduct = (variant.product as any)?.payload_product?.[0] as PayloadCollectionItem
        if (!payloadProduct) {return}
        if (!items[payloadProduct.id]) {
          items[payloadProduct.id] = {
            variants: payloadProduct.variants || [],
          }
        }

        items[payloadProduct.id].variants.push({
          title: variant.title,
          medusa_id: variant.id,
          option_values: variant.options.map((option) => ({
            medusa_id: option.id,
            medusa_option_id: option.option?.id,
            value: option.value,
          })),
        })
      })
      
      return {
        collection: "products",
        items: Object.keys(items).map((id) => ({
          id,
          ...items[id],
        })),
      }
    })

    const result = when({ updateData }, (data) => data.updateData.items.length > 0)
      .then(() => {
        return updatePayloadItemsStep(updateData)
      })

    const items = transform({ result }, (data) => data.result?.items || [])

    return new WorkflowResponse({
      items,
    })
  }
)