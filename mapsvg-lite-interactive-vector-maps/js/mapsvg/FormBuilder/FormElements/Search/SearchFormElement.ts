import { parseBoolean } from "@/Core/Utils"
import { SchemaField } from "../../../Infrastructure/Server/SchemaField"
import { FormBuilder } from "../../FormBuilder"
import { FormElement } from "../FormElement"
// import "./styles.css"

const $ = jQuery

/**
 *
 */
export class SearchFormElement extends FormElement {
  searchFallback: boolean
  width: string

  constructor(options: SchemaField, formBuilder: FormBuilder, external: { [key: string]: any }) {
    super(options, formBuilder, external)

    this.searchFallback = parseBoolean(options.searchFallback) || false
    this.width = options.width || "100%"
    this.name = "search"
    this.parameterName = "search"
    this.parameterNameShort = "search"
    this.typeLabel = "Text Search"
  }

  setDomElements() {
    super.setDomElements()
    this.inputs.text = $(this.domElements.main).find("input")[0]
  }

  setEventHandlers(): void {
    super.setEventHandlers()
    // input observes the committed value, including paste and the native clear
    // control. The paste event runs before the input's value has changed.
    $(this.inputs.text).on("input change", (e) => {
      this.setValue(e.target.value, false)
      this.triggerChanged()
    })
  }

  setPlaceholder(placeholder: string) {
    $(this.inputs.text).attr("placeholder", placeholder)
    $(this.inputs.select).trigger("change.select2")
  }

  setInputValue(value: string | null): void {
    this.inputs.text.value = value
  }

  getSchema(): { [p: string]: any } {
    const schema = super.getSchema()
    schema.searchFallback = parseBoolean(this.searchFallback)
    schema.placeholder = this.placeholder
    schema.width = this.width
    return schema
  }
}
