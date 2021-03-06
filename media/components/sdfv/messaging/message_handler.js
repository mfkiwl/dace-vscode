// Copyright 2020-2021 ETH Zurich and the DaCe-VSCode authors.
// All rights reserved.

class MessageHandler {

    constructor() {}

    handle_message(message) {
        let el = undefined;
        switch (message.type) {
            case 'load_instrumentation_report':
                renderer.overlay_manager.deregister_overlay(
                    GenericSdfgOverlay.OVERLAY_TYPE.STATIC_FLOPS
                );
                instrumentation_report_read_complete(message.result);
                // Fall through to set the criterium.
            case 'instrumentation_report_change_criterium':
                if (message.criterium) {
                    const ol = renderer.overlay_manager.get_overlay(
                        GenericSdfgOverlay.OVERLAY_TYPE.STATIC_FLOPS
                    );
                    if (ol) {
                        ol.criterium = message.criterium;
                        ol.refresh();
                    }
                }
                break;
            case 'clear_instrumentation_report':
                renderer.overlay_manager.deregister_overlay(
                    GenericSdfgOverlay.OVERLAY_TYPE.RUNTIME_US
                );
                break;
            case 'symbol_value_changed':
                if (message.symbol !== undefined && renderer)
                    renderer.overlay_manager.symbol_value_changed(
                        message.symbol,
                        message.value
                    );
                break;
            case 'update_badness_scale_method':
                if (message.method !== undefined && renderer)
                    renderer.overlay_manager.update_badness_scale_method(
                        message.method
                    );
                break;
            case 'register_overlay':
                if (message.overlay !== undefined && renderer)
                    renderer.overlay_manager.register_overlay(message.overlay);
                break;
            case 'deregister_overlay':
                if (message.overlay !== undefined && renderer)
                    renderer.overlay_manager.deregister_overlay(message.overlay);
                break;
            case 'refresh_symbol_list':
                analysis_pane_refresh_symbols();
                break;
            case 'refresh_analysis_pane':
                refresh_analysis_pane();
                break;
            case 'refresh_outline':
                if (renderer)
                    outline(renderer, renderer.graph);
                break;
            case 'refresh_transformation_list':
                refresh_transformation_list();
                break;
            case 'resync_transformation_list':
                clear_selected_transformation();
                if (transformations !== undefined &&
                    transformations !== [[], [], [], []])
                    refresh_transformation_list();
                else
                    get_applicable_transformations();
                break;
            case 'get_applicable_transformations':
                clear_selected_transformation();
                get_applicable_transformations();
                break;
            case 'get_applicable_transformations_callback':
                if (message.transformations !== undefined)
                    transformations = [[], [], [], message.transformations];
                else
                    transformations = [[], [], [], []];
                const hide_loading = true;
                sort_transformations(refresh_transformation_list, hide_loading);
                break;
            case 'flopsCallback':
                if (renderer && renderer.overlay_manager &&
                    renderer.overlay_manager.static_flops_overlay_active) {
                    const overlay = renderer.overlay_manager.get_overlay(
                        GenericSdfgOverlay.OVERLAY_TYPE.STATIC_FLOPS
                    );
                    if (overlay !== undefined && message.map !== undefined)
                        overlay.update_flops_map(message.map);
                }
                break;
            case 'update':
                window.viewing_history_state = false;
                el = document.getElementById('exit-preview-button');
                if (el)
                    el.className = 'button hidden';
                if (message.prevent_refreshes)
                    setRendererContent(message.text, false, true);
                else
                    setRendererContent(message.text);
                break;
            case 'processing':
                if (message.show && message.show === true) {
                    $('#processing-overlay').show();
                    $('#processing-overlay-msg').text(message.text);
                } else {
                    $('#processing-overlay').hide();
                    $('#processing-overlay-msg').text();
                }
                break;
            case 'preview_sdfg':
                setRendererContent(message.text, true);
                el = document.getElementById('exit-preview-button');
                if (el)
                    el.className = 'button';

                if (message.hist_state !== undefined && message.hist_state) {
                    clear_info_box();
                    window.viewing_history_state = true;
                    refresh_transformation_list();
                }
                break;
            case 'exit_preview':
                resetRendererContent();
                window.viewing_history_state = false;
                el = document.getElementById('exit-preview-button');
                if (el)
                    el.className = 'button hidden';
                if (message.refresh_transformations)
                    refresh_transformation_list();
                break;
            case 'highlight_elements':
                if (message.elements)
                    highlight_uuids(Object.values(message.elements));
                break;
            case 'zoom_to_node':
                if (message.uuid !== undefined)
                    zoom_to_uuids([message.uuid]);
                break;
            case 'select_transformation':
                if (message.transformation !== undefined) {
                    show_transformation_details(message.transformation);
                    window.selected_transformation = message.transformation;
                }
                break;
            case 'clear_selected_transformation':
                clear_selected_transformation();
                break;
            case 'get_enum_callback':
                if (message.enum)
                    switch (message.name) {
                        case 'InstrumentationType':
                            window.instruments = message.enum;
                            break;
                        default:
                            break;
                    }
                break;
        }
    }

}