import { deepMerge } from "@/Core/Utils"
import { SchemaField } from "../../../Infrastructure/Server/SchemaField"
import { FormBuilder } from "../../FormBuilder"
import { FormElement } from "../FormElement"

const $ = jQuery

/**
 * Status field editor: data only ({ label, value }).
 * SVG color / disabled live in map options.regionStatuses (Components → Region).
 */
export class StatusFormElement extends FormElement {
  declare inputs: { select: HTMLSelectElement }

  constructor(options: SchemaField, formBuilder: FormBuilder, external: { [key: string]: any }) {
    super(options, formBuilder, external)
    this.label = options.label || "Status"
    this.name = "status"
    this.typeLabel = "Status"
    this.setOptions(options.options)
  }

  setDomElements() {
    super.setDomElements()

    this.inputs.select = $(this.domElements.main).find("select")[0]
  }

  destroy() {
    if ($().mselect2) {
      const sel = $(this.domElements.main).find(".mapsvg-select2")
      if (sel.length) {
        sel.mselect2("destroy")
      }
    }
  }

  setEditorEventHandlers() {
    super.setEditorEventHandlers()
    const _this = this
    $(this.domElements.edit).on("keyup change paste", ".mapsvg-edit-status-row input", function () {
      _this.mayBeAddStatusRow()
    })
  }

  initEditor() {
    super.initEditor()
    this.mayBeAddStatusRow()
  }

  mayBeAddStatusRow(): void {
    const _this = this
    const editStatusRow = $($("#mapsvg-edit-status-row").html())
    const z = $(_this.domElements.edit).find(".mapsvg-edit-status-label:last-child")
    if (z && z.last() && z.last().val() && (z.last().val() + "").trim().length) {
      const newRow = editStatusRow.clone()
      newRow.insertAfter($(_this.domElements.edit).find(".mapsvg-edit-status-row:last-child"))
    }
    const rows = $(_this.domElements.edit).find(".mapsvg-edit-status-row")
    const row1 = rows.eq(rows.length - 2)
    const row2 = rows.eq(rows.length - 1)

    if (
      row1.length &&
      row2.length &&
      !(
        row1.find("input:eq(0)").val().toString().trim() ||
        row1.find("input:eq(1)").val().toString().trim()
      ) &&
      !(
        row2.find("input:eq(0)").val().toString().trim() ||
        row2.find("input:eq(1)").val().toString().trim()
      )
    ) {
      row2.remove()
    }
  }

  setEventHandlers(): void {
    super.setEventHandlers()
    $(this.inputs.select).on("change keyup paste", (e) => {
      this.setValue(e.target.value, false)
      this.triggerChanged()
    })
  }

  getSchema(): { [p: string]: any } {
    const schema = super.getSchema()

    const opts = deepMerge({}, { options: this.options })
    schema.options = (opts.options || [])
      .filter((option) => option && option.value !== "" && option.value != null)
      .map((option) => ({
        label: option.label,
        value: option.value,
      }))
    schema.optionsDict = {}
    schema.options.forEach(function (option) {
      schema.optionsDict[option.value] = option
    })

    return schema
  }

  setInputValue(value: string): void {
    this.inputs.select.value = value
  }
}
