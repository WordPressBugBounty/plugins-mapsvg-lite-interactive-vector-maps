import { Controller, ControllerOptions } from "@/Core/Controller"
import { BaseEventHandler } from "@/Core/Events"

export enum ToolbarEvent {
  CLICK = "click",
  MOUSEOVER = "mouseover",
  MOUSEOUT = "mouseout",
}

interface ToolbarControllerOptions extends ControllerOptions {
  events: ControllerOptions["events"] & {
    [K in ToolbarEvent]?: BaseEventHandler<{
      buttonName: string
    }>
  }
}

const template = `
    <div class="mapsvg-mobile-buttons">    
      <button type="button" class="mapsvg-button mapsvg-button-menu" data-controller="menu"><i class="mapsvg-icon-menu"></i>
          {{labelList}}
      </button>
      <button type="button" class="mapsvg-button mapsvg-button-map" data-controller="map"><i class="mapsvg-icon-map"></i>
          {{labelMap}}
      </button>
    </div>`

export class ToolbarController extends Controller {
  buttons: { [key: string]: HTMLButtonElement }
  constructor(options: ToolbarControllerOptions) {
    options = {
      ...options,
      template,
      opened: true,
      closable: false,
      scrollable: false,
      fullscreen: false,
      autoresize: false,
      withToolbar: false,
      noPadding: true,
    }
    super(options)
    this.name = "toolbar"
    this.classList.push("mapsvg-toolbar")
  }

  viewDidRedraw() {
    super.viewDidRedraw()
    this.buttons = {}
    this.buttons.menu = $(this.containers.view).find(".mapsvg-button-menu")[0] as HTMLButtonElement
    this.buttons.map = $(this.containers.view).find(".mapsvg-button-map")[0] as HTMLButtonElement
    this.setActive(this.state.active || "map")
  }

  setEventHandlers() {
    super.setEventHandlers()
    $(this.containers.view).on("click.toolbar.mapsvg", ".mapsvg-button", (e) => {
      const buttonName = e.currentTarget.getAttribute("data-controller")
      const button = this.buttons[buttonName]
      this.setActive(buttonName)

      this.events.trigger("click", e, {
        target: button,
        buttonName,
      })
    })
  }

  setActive(controllerName: string) {
    this.state.active = controllerName
    for (const [name, button] of Object.entries(this.buttons || {})) {
      button.classList.toggle("active", name === controllerName)
      button.setAttribute("aria-pressed", String(name === controllerName))
    }
  }

  show(controllerName: string) {
    $(this.buttons[controllerName]).trigger("click")
  }
}
