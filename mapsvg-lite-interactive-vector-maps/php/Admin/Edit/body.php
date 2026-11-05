<!-- FORM -->
<!--<table id="mapsvg-table-maps" class="table table-striped" style="height:
325px;" width="824">-->
<!--<table id="mapsvg-table-maps" class="table table-striped" width="100%">-->
<div id="mapsvg-panels" class="stretch">
  <div class="mapsvg-panel mapsvg-panel-left stretch" id="mapsvg-container">
    <div class="alert alert-warning alert-dismissible" id="mapsvg-auto-id-warning" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&#xD7;</span>
      </button>
      <strong>Warning!</strong> Some objects in SVG file are missing their IDs. MapSVG generated IDs
      but please note that if you will edit SVG file later and add/remove some objects, it would
      change objects order and ID references would be lost.
    </div>
    <div id="mapsvg-preview-buttons">
      <div
        class="btn-group-xs btn-group-toggle"
        data-toggle="buttons"
        id="mapsvg-preview-containers-toggle">
        <input
          id="containerOption"
          class="btn-check"
          type="checkbox"
          name="mapsvg-preview-containers-toggle"
          value="1"
          checked
          autocomplete="off" />
        <label
          for="containerOption"
          class="btn btn-outline-secondary btn-xs">
          Containers</label>
      </div>
      <div
        class="btn-group-xs btn-group btn-group-toggle"
        data-toggle="buttons"
        id="mapsvg-map-mode">
        <input
          id="previewOption"
          type="radio"
          class="btn-check"
          name="mapsvg_map_mode"
          value="preview"
          autocomplete="off"
          checked />
        <label
          for="previewOption"
          class="btn btn-outline-secondary btn-xs active"
          data-mode="preview">
          Preview</label>

        <input
          id="addRegOption"
          type="radio"
          class="btn-check"
          name="mapsvg_map_mode"
          value="addRegions"
          autocomplete="off" />
        <label
          for="addRegOption"
          class="btn btn-outline-secondary btn-xs"
          data-mode="addRegions"
          style="display: none">
          Add regions</label>

        <input
          id="editRegOption"
          type="radio"
          class="btn-check"
          name="mapsvg_map_mode"
          value="editRegions"
          autocomplete="off" />
        <label for="editRegOption" class="btn btn-outline-secondary btn-xs" data-mode="editRegions">
          Edit regions</label>

        <input
          id="editDbOption"
          type="radio"
          class="btn-check"
          name="mapsvg_map_mode"
          value="editData"
          autocomplete="off" />
        <label for="editDbOption" class="btn btn-outline-secondary btn-xs" data-mode="editData">
          Edit DB objects</label>
      </div>
    </div>
    <div id="mapsvg-sizer">
      <div id="mapsvg" data-autoload="true" data-map-id="<?php echo esc_html($data["map"]->id); ?>"></div>
    </div>
  </div>
  <button
    type="button"
    id="mapsvg-panels-resizer"
    class="mapsvg-panels-resizer"
    aria-label="Resize panels"
    title="Drag to resize panels">
    <i class="bi bi-grip-vertical" aria-hidden="true"></i>
  </button>
  <div class="stretch mapsvg-panel mapsvg-panel-right">
    <ul class="nav nav-tabs" id="mapsvg-tabs-menu">
      <li class="toggle-tooltip nav-item" title="Components">
        <a href="#tab_components" class="nav-link active"><i class="bi-puzzle"></i></a>
      </li>
      <li class="toggle-tooltip nav-item" title="Data">
        <a href="#tab_database" class="nav-link"><i class="bi-database"></i></a>
      </li>
      <li class="toggle-tooltip nav-item" title="Connections">
        <a href="#tab_connections" class="nav-link"><i class="bi-plug"></i></a>
      </li>
      <li class="toggle-tooltip nav-item" title="Actions">
        <a href="#tab_actions" class="nav-link"><i class="bi-mouse2"></i></a>
      </li>
      <li class="mapsvg-draw-menu-item nav-item">
        <a href="#tab_draw_region" class="nav-link">SVG Object</a>
      </li>
    </ul>
    <div id="mapsvg-mapform-container" class="stretch mapsvg-scrollable-content">
      <div class="tab-content" id="mapsvg-tabs">
        <div class="tab-pane active" id="tab_components" data-controller="components"></div>
        <div class="tab-pane" id="tab_database" data-controller="database">
          <div class="full-flex" id="database-controller"></div>
        </div>
        <div class="tab-pane" id="tab_connections" data-controller="connections"></div>
        <div class="tab-pane" id="tab_actions" data-controller="actions"></div>
        <div
          class="tab-pane mapsvg-draw-controller"
          id="tab_draw_region"
          data-controller="draw-region"></div>
      </div>
    </div>
  </div>
</div>
