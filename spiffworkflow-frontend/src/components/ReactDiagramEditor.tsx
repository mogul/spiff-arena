/* eslint-disable sonarjs/cognitive-complexity */
import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  // @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'bpmn... RemoFve this comment to see the full error message
} from 'bpmn-js-properties-panel';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'bpmn... RemoFve this comment to see the full error message
import CliModule from 'bpmn-js-cli';

// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'dmn-... Remove this comment to see the full error message
import DmnModeler from 'dmn-js/lib/Modeler';
import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
  // @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'dmn-... Remove this comment to see the full error message
} from 'dmn-js-properties-panel';

import React, { useEffect, useState, useCallback } from 'react';
// @ts-ignore
import { Button, ButtonSet, Modal, UnorderedList, Link } from '@carbon/react';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-properties-panel/dist/assets/properties-panel.css';
import '../bpmn-js-properties-panel.css';
import 'bpmn-js/dist/assets/bpmn-js.css';

import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css';
import 'dmn-js-properties-panel/dist/assets/properties-panel.css';

// @ts-expect-error TS(7016) FIXME
import spiffworkflow from 'bpmn-js-spiffworkflow/app/spiffworkflow';
import 'bpmn-js-spiffworkflow/app/css/app.css';

import spiffModdleExtension from 'bpmn-js-spiffworkflow/app/spiffworkflow/moddle/spiffworkflow.json';

// @ts-expect-error TS(7016) FIXME
import KeyboardMoveModule from 'diagram-js/lib/navigation/keyboard-move';
// @ts-expect-error TS(7016) FIXME
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
// @ts-expect-error TS(7016) FIXME
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';

// @ts-expect-error TS(7016) FIXME
import TouchModule from 'diagram-js/lib/navigation/touch';

import { useNavigate } from 'react-router-dom';

import { Can } from '@casl/react';
import { ZoomIn, ZoomOut, ZoomFit } from '@carbon/icons-react';
import HttpService from '../services/HttpService';

import ButtonWithConfirmation from './ButtonWithConfirmation';
import {
  getBpmnProcessIdentifiers,
  makeid,
  modifyProcessIdentifierForPathParam,
} from '../helpers';
import { useUriListForPermissions } from '../hooks/UriListForPermissions';
import { PermissionsToCheck, ProcessReference, Task } from '../interfaces';
import { usePermissionFetcher } from '../hooks/PermissionService';

type OwnProps = {
  processModelId: string;
  diagramType: string;
  activeUserElement?: React.ReactElement;
  callers?: ProcessReference[];
  diagramXML?: string | null;
  disableSaveButton?: boolean;
  fileName?: string;
  isPrimaryFile?: boolean;
  onCallActivityOverlayClick?: (..._args: any[]) => any;
  onDataStoresRequested?: (..._args: any[]) => any;
  onDeleteFile?: (..._args: any[]) => any;
  onDmnFilesRequested?: (..._args: any[]) => any;
  onElementClick?: (..._args: any[]) => any;
  onElementsChanged?: (..._args: any[]) => any;
  onJsonSchemaFilesRequested?: (..._args: any[]) => any;
  onLaunchBpmnEditor?: (..._args: any[]) => any;
  onLaunchDmnEditor?: (..._args: any[]) => any;
  onLaunchJsonSchemaEditor?: (..._args: any[]) => any;
  onLaunchMarkdownEditor?: (..._args: any[]) => any;
  onLaunchScriptEditor?: (..._args: any[]) => any;
  onLaunchMessageEditor?: (..._args: any[]) => any;
  onMessagesRequested?: (..._args: any[]) => any;
  onSearchProcessModels?: (..._args: any[]) => any;
  onServiceTasksRequested?: (..._args: any[]) => any;
  onSetPrimaryFile?: (..._args: any[]) => any;
  saveDiagram?: (..._args: any[]) => any;
  tasks?: Task[] | null;
  url?: string;
};

const FitViewport = 'fit-viewport';

// https://codesandbox.io/s/quizzical-lake-szfyo?file=/src/App.js was a handy reference
export default function ReactDiagramEditor({
  activeUserElement,
  callers,
  diagramType,
  diagramXML,
  disableSaveButton,
  fileName,
  isPrimaryFile,
  onCallActivityOverlayClick,
  onDataStoresRequested,
  onDeleteFile,
  onDmnFilesRequested,
  onElementClick,
  onElementsChanged,
  onJsonSchemaFilesRequested,
  onLaunchBpmnEditor,
  onLaunchDmnEditor,
  onLaunchJsonSchemaEditor,
  onLaunchMarkdownEditor,
  onLaunchScriptEditor,
  onLaunchMessageEditor,
  onMessagesRequested,
  onSearchProcessModels,
  onServiceTasksRequested,
  onSetPrimaryFile,
  processModelId,
  saveDiagram,
  tasks,
  url,
}: OwnProps) {
  const [diagramXMLString, setDiagramXMLString] = useState('');
  const [diagramModelerState, setDiagramModelerState] = useState<any>(null);
  const [performingXmlUpdates, setPerformingXmlUpdates] = useState(false);

  const { targetUris } = useUriListForPermissions();
  const permissionRequestData: PermissionsToCheck = {};

  if (diagramType !== 'readonly') {
    permissionRequestData[targetUris.processModelShowPath] = ['PUT'];
    permissionRequestData[targetUris.processModelFileShowPath] = [
      'POST',
      'GET',
      'PUT',
      'DELETE',
    ];
  }

  const { ability } = usePermissionFetcher(permissionRequestData);
  const navigate = useNavigate();

  const [showingReferences, setShowingReferences] = useState(false);

  const zoom = useCallback(
    (amount: number) => {
      if (diagramModelerState) {
        let modeler = diagramModelerState as any;
        if (diagramType === 'dmn') {
          modeler = (diagramModelerState as any).getActiveViewer();
        }
        if (modeler) {
          if (amount === 0) {
            const canvas = modeler.get('canvas');
            canvas.zoom(FitViewport, 'auto');
          } else {
            modeler.get('zoomScroll').stepZoom(amount);
          }
        }
      }
    },
    [diagramModelerState, diagramType],
  );

  /* This restores unresolved references that camunda removes, I wish we could move this to the bpmn-io extensions */
  // @ts-ignore
  const fixUnresolvedReferences = (diagramModelerToUse: any): null => {
    // @ts-ignore
    diagramModelerToUse.on('import.parse.complete', (event) => {
      if (!event.references) {
        return;
      }
      const refs = event.references.filter(
        (r: any) =>
          r.property === 'bpmn:loopDataInputRef' ||
          r.property === 'bpmn:loopDataOutputRef',
      );
      // eslint-disable-next-line no-underscore-dangle
      const desc = diagramModelerToUse._moddle.registry.getEffectiveDescriptor(
        'bpmn:ItemAwareElement',
      );
      refs.forEach((ref: any) => {
        const props = {
          id: ref.id,
          name: ref.id ? typeof ref.name === 'undefined' : ref.name,
        };
        const elem = diagramModelerToUse._moddle.create(desc, props); // eslint-disable-line no-underscore-dangle
        elem.$parent = ref.element;
        ref.element.set(ref.property, elem);
      });
    });
  };

  // create the diagram modeler and set editor events
  useEffect(() => {
    console.log('RENDER DIAGRAM');
    let canvasClass = 'diagram-editor-canvas';
    if (diagramType === 'readonly') {
      canvasClass = 'diagram-viewer-canvas';
    }

    const temp = document.createElement('template');
    const panelId: string =
      diagramType === 'readonly'
        ? 'hidden-properties-panel'
        : 'js-properties-panel';
    temp.innerHTML = `
      <div class="content with-diagram" id="js-drop-zone">
        <div class="canvas ${canvasClass}" id="canvas"></div>
        <div class="properties-panel-parent" id="${panelId}"></div>
      </div>
    `;
    const frag = temp.content;

    const diagramContainerElement =
      document.getElementById('diagram-container');
    if (diagramContainerElement) {
      diagramContainerElement.innerHTML = '';
      diagramContainerElement.appendChild(frag);
    }

    let diagramModeler: any = null;
    // let diagramModeler: any = diagramModelerState;

    if (!diagramModeler) {
      if (diagramType === 'bpmn') {
        diagramModeler = new BpmnModeler({
          container: '#canvas',
          keyboard: {
            bindTo: document,
          },
          propertiesPanel: {
            parent: '#js-properties-panel',
          },
          additionalModules: [
            spiffworkflow,
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            ZoomScrollModule,
            CliModule,
          ],
          cli: {
            bindTo: 'cli',
          },
          moddleExtensions: {
            spiffworkflow: spiffModdleExtension,
          },
        });
      } else if (diagramType === 'dmn') {
        diagramModeler = new DmnModeler({
          container: '#canvas',
          keyboard: {
            bindTo: document,
          },
          drd: {
            propertiesPanel: {
              parent: '#js-properties-panel',
            },
            additionalModules: [
              DmnPropertiesPanelModule,
              DmnPropertiesProviderModule,
              ZoomScrollModule,
            ],
          },
        });
      } else if (diagramType === 'readonly') {
        diagramModeler = new BpmnViewer({
          container: '#canvas',
          keyboard: {
            bindTo: document,
          },

          // taken from the non-modeling components at
          //  bpmn-js/lib/Modeler.js
          additionalModules: [
            KeyboardMoveModule,
            MoveCanvasModule,
            TouchModule,
            ZoomScrollModule,
          ],
        });
      }
    }

    function handleLaunchScriptEditor(
      element: any,
      script: string,
      scriptType: string,
      eventBus: any,
    ) {
      if (onLaunchScriptEditor) {
        setPerformingXmlUpdates(true);
        const modeling = diagramModeler.get('modeling');
        onLaunchScriptEditor(element, script, scriptType, eventBus, modeling);
      }
    }

    function handleLaunchMarkdownEditor(
      element: any,
      value: string,
      eventBus: any,
    ) {
      if (onLaunchMarkdownEditor) {
        setPerformingXmlUpdates(true);
        onLaunchMarkdownEditor(element, value, eventBus);
      }
    }

    function handleElementClick(event: any) {
      if (onElementClick) {
        const canvas = diagramModeler.get('canvas');
        const bpmnProcessIdentifiers = getBpmnProcessIdentifiers(
          canvas.getRootElement(),
        );
        onElementClick(event.element, bpmnProcessIdentifiers);
      }
    }

    function handleServiceTasksRequested(event: any) {
      if (onServiceTasksRequested) {
        onServiceTasksRequested(event);
      }
    }

    function handleDataStoresRequested(event: any) {
      if (onDataStoresRequested) {
        onDataStoresRequested(event);
      }
    }

    // if (!diagramModelerState) {
    setDiagramModelerState(diagramModeler);
    // }

    diagramModeler.on('spiff.script.edit', (event: any) => {
      console.log('HEY IN EDIT');
      const { error, element, scriptType, script, eventBus } = event;
      if (error) {
        console.error(error);
      }
      handleLaunchScriptEditor(element, script, scriptType, eventBus);
    });

    diagramModeler.on('spiff.markdown.edit', (event: any) => {
      const { error, element, value, eventBus } = event;
      if (error) {
        console.error(error);
      }
      handleLaunchMarkdownEditor(element, value, eventBus);
    });

    diagramModeler.on('spiff.callactivity.edit', (event: any) => {
      if (onLaunchBpmnEditor) {
        onLaunchBpmnEditor(event.processId);
      }
    });

    diagramModeler.on('spiff.file.edit', (event: any) => {
      const { error, element, value, eventBus } = event;
      if (error) {
        console.error(error);
      }
      if (onLaunchJsonSchemaEditor) {
        onLaunchJsonSchemaEditor(element, value, eventBus);
      }
    });

    diagramModeler.on('spiff.dmn.edit', (event: any) => {
      if (onLaunchDmnEditor) {
        onLaunchDmnEditor(event.value);
      }
    });

    // 'element.hover',
    // 'element.out',
    // 'element.click',
    // 'element.dblclick',
    // 'element.mousedown',
    // 'element.mouseup',
    diagramModeler.on('element.click', (element: any) => {
      console.log('WE CLICK ELMEENT');
      handleElementClick(element);
    });
    diagramModeler.on('elements.changed', (event: any) => {
      if (onElementsChanged) {
        onElementsChanged(event);
      }
    });

    diagramModeler.on('spiff.service_tasks.requested', (event: any) => {
      handleServiceTasksRequested(event);
    });

    diagramModeler.on('spiff.data_stores.requested', (event: any) => {
      handleDataStoresRequested(event);
    });

    diagramModeler.on('spiff.json_schema_files.requested', (event: any) => {
      if (onJsonSchemaFilesRequested) {
        onJsonSchemaFilesRequested(event);
      }
    });

    diagramModeler.on('spiff.dmn_files.requested', (event: any) => {
      if (onDmnFilesRequested) {
        onDmnFilesRequested(event);
      }
    });

    diagramModeler.on('spiff.messages.requested', (event: any) => {
      if (onMessagesRequested) {
        onMessagesRequested(event);
      }
    });

    diagramModeler.on('spiff.json_schema_files.requested', (event: any) => {
      handleServiceTasksRequested(event);
    });

    diagramModeler.on('spiff.callactivity.search', (event: any) => {
      if (onSearchProcessModels) {
        onSearchProcessModels(event.value, event.eventBus, event.element);
      }
    });

    diagramModeler.on('spiff.message.edit', (event: any) => {
      if (onLaunchMessageEditor) {
        onLaunchMessageEditor(event);
      }
    });
  }, [
    diagramType,
    onDataStoresRequested,
    onDmnFilesRequested,
    onElementClick,
    onElementsChanged,
    onJsonSchemaFilesRequested,
    onLaunchBpmnEditor,
    onLaunchDmnEditor,
    onLaunchJsonSchemaEditor,
    onLaunchMarkdownEditor,
    onLaunchScriptEditor,
    onLaunchMessageEditor,
    onMessagesRequested,
    onSearchProcessModels,
    onServiceTasksRequested,
  ]);

  // const addOverlayOnCallActivity = useCallback(
  //   (task: Task, bpmnProcessIdentifiers: string[]) => {
  //     if (
  //       !onCallActivityOverlayClick ||
  //       diagramType !== 'readonly' ||
  //       !diagramModelerState
  //     ) {
  //       return;
  //     }
  //     function domify(htmlString: string) {
  //       const template = document.createElement('template');
  //       template.innerHTML = htmlString.trim();
  //       return template.content.firstChild;
  //     }
  //     const createCallActivityOverlay = () => {
  //       const overlays = diagramModelerState.get('overlays');
  //       const ARROW_DOWN_SVG =
  //         '<svg width="20" height="20" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"> <g id="SVGRepo_bgCarrier" stroke-width="0"> <rect x="0" y="0" width="24.00" height="24.00" rx="0" fill="#2196f3" strokewidth="0"/> </g> <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"/> <g id="SVGRepo_iconCarrier"> <path d="M7 17L17 7M17 7H8M17 7V16" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/> </g> </svg>';
  //       const button: any = domify(
  //         `<button class="bjs-drilldown">${ARROW_DOWN_SVG}</button>`,
  //       );
  //       button.addEventListener('click', () => {
  //         onCallActivityOverlayClick(task);
  //         setDiagramXMLString('');
  //         setDiagramModelerState(null);
  //       });
  //       overlays.add(task.bpmn_identifier, 'drilldown', {
  //         position: {
  //           bottom: -10,
  //           right: -8,
  //         },
  //         html: button,
  //       });
  //     };
  //     try {
  //       if (
  //         bpmnProcessIdentifiers.includes(
  //           task.bpmn_process_definition_identifier,
  //         )
  //       ) {
  //         createCallActivityOverlay();
  //       }
  //     } catch (bpmnIoError: any) {
  //       // the task list also contains task for processes called from call activities which will
  //       // not exist in this diagram so just ignore them for now.
  //       if (
  //         bpmnIoError.message !==
  //         "Cannot read properties of undefined (reading 'id')"
  //       ) {
  //         throw bpmnIoError;
  //       }
  //     }
  //   },
  //   [diagramModelerState, diagramType, onCallActivityOverlayClick],
  // );
  //
  // const handleError = useCallback((err: any) => {
  //   console.error('ERROR:', err);
  // }, []);
  //
  // const onImportDone = useCallback(
  //   (event: any) => {
  //     const { error } = event;
  //
  //     if (error) {
  //       handleError(error);
  //       return;
  //     }
  //
  //     // These seem to be system tasks that cannot be highlighted
  //     const taskSpecsThatCannotBeHighlighted = ['Root', 'Start', 'End'];
  //
  //     function checkTaskCanBeHighlighted(taskBpmnId: string) {
  //       return (
  //         !taskSpecsThatCannotBeHighlighted.includes(taskBpmnId) &&
  //         !taskBpmnId.match(/EndJoin/) &&
  //         !taskBpmnId.match(/BoundaryEventParent/) &&
  //         !taskBpmnId.match(/BoundaryEventJoin/) &&
  //         !taskBpmnId.match(/BoundaryEventSplit/)
  //       );
  //     }
  //
  //     function highlightBpmnIoElement(
  //       canvas: any,
  //       task: Task,
  //       bpmnIoClassName: string,
  //       bpmnProcessIdentifiers: string[],
  //     ) {
  //       if (checkTaskCanBeHighlighted(task.bpmn_identifier)) {
  //         try {
  //           if (
  //             bpmnProcessIdentifiers.includes(
  //               task.bpmn_process_definition_identifier,
  //             )
  //           ) {
  //             canvas.addMarker(task.bpmn_identifier, bpmnIoClassName);
  //           }
  //         } catch (bpmnIoError: any) {
  //           // the task list also contains task for processes called from call activities which will
  //           // not exist in this diagram so just ignore them for now.
  //           if (
  //             bpmnIoError.message !==
  //             "Cannot read properties of undefined (reading 'id')"
  //           ) {
  //             throw bpmnIoError;
  //           }
  //         }
  //       }
  //     }
  //
  //     let modeler = diagramModelerState;
  //     if (diagramType === 'dmn') {
  //       modeler = (diagramModelerState as any).getActiveViewer();
  //     }
  //
  //     const canvas = (modeler as any).get('canvas');
  //     canvas.zoom(FitViewport, 'auto'); // Concerned this might bug out somehow.
  //
  //     // highlighting a field
  //     // Option 3 at:
  //     //  https://github.com/bpmn-io/bpmn-js-examples/tree/master/colors
  //     if (tasks) {
  //       console.log('tasks', tasks.length);
  //       const bpmnProcessIdentifiers = getBpmnProcessIdentifiers(
  //         canvas.getRootElement(),
  //       );
  //       tasks.forEach((task: Task) => {
  //         let className = '';
  //         if (task.state === 'COMPLETED') {
  //           className = 'completed-task-highlight';
  //         } else if (['READY', 'WAITING', 'STARTED'].includes(task.state)) {
  //           className = 'active-task-highlight';
  //         } else if (task.state === 'CANCELLED') {
  //           className = 'cancelled-task-highlight';
  //         } else if (task.state === 'ERROR') {
  //           className = 'errored-task-highlight';
  //         }
  //         if (className) {
  //           highlightBpmnIoElement(
  //             canvas,
  //             task,
  //             className,
  //             bpmnProcessIdentifiers,
  //           );
  //         }
  //         if (
  //           task.typename === 'CallActivity' &&
  //           !['FUTURE', 'LIKELY', 'MAYBE'].includes(task.state)
  //         ) {
  //           addOverlayOnCallActivity(task, bpmnProcessIdentifiers);
  //         }
  //       });
  //     }
  //   },
  //   [
  //     addOverlayOnCallActivity,
  //     diagramModelerState,
  //     diagramType,
  //     handleError,
  //     tasks,
  //   ],
  // );

  // import xml and update diagram display
  useEffect(() => {
    // console.log('diagramModelerState111', diagramModelerState);
    if (!diagramXMLString || !diagramModelerState) {
      return undefined;
    }
    console.log('DISPLAY DIAGRAM');
    console.log('diagramXMLString', diagramXMLString);
    console.log('diagramModelerState', diagramModelerState);

    const addOverlayOnCallActivity = (
      task: Task,
      bpmnProcessIdentifiers: string[],
    ) => {
      if (
        !onCallActivityOverlayClick ||
        diagramType !== 'readonly' ||
        !diagramModelerState
      ) {
        return;
      }
      function domify(htmlString: string) {
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstChild;
      }
      const createCallActivityOverlay = () => {
        const overlays = diagramModelerState.get('overlays');
        const ARROW_DOWN_SVG =
          '<svg width="20" height="20" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"> <g id="SVGRepo_bgCarrier" stroke-width="0"> <rect x="0" y="0" width="24.00" height="24.00" rx="0" fill="#2196f3" strokewidth="0"/> </g> <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"/> <g id="SVGRepo_iconCarrier"> <path d="M7 17L17 7M17 7H8M17 7V16" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/> </g> </svg>';
        const button: any = domify(
          `<button class="bjs-drilldown">${ARROW_DOWN_SVG}</button>`,
        );
        button.addEventListener('click', () => {
          onCallActivityOverlayClick(task);
          setDiagramXMLString('');
          setDiagramModelerState(null);
        });
        overlays.add(task.bpmn_identifier, 'drilldown', {
          position: {
            bottom: -10,
            right: -8,
          },
          html: button,
        });
      };
      try {
        if (
          bpmnProcessIdentifiers.includes(
            task.bpmn_process_definition_identifier,
          )
        ) {
          createCallActivityOverlay();
        }
      } catch (bpmnIoError: any) {
        // the task list also contains task for processes called from call activities which will
        // not exist in this diagram so just ignore them for now.
        if (
          bpmnIoError.message !==
          "Cannot read properties of undefined (reading 'id')"
        ) {
          throw bpmnIoError;
        }
      }
    };

    const handleError = (err: any) => {
      console.error('ERROR:', err);
    };
    // These seem to be system tasks that cannot be highlighted
    const taskSpecsThatCannotBeHighlighted = ['Root', 'Start', 'End'];

    function checkTaskCanBeHighlighted(taskBpmnId: string) {
      return (
        !taskSpecsThatCannotBeHighlighted.includes(taskBpmnId) &&
        !taskBpmnId.match(/EndJoin/) &&
        !taskBpmnId.match(/BoundaryEventParent/) &&
        !taskBpmnId.match(/BoundaryEventJoin/) &&
        !taskBpmnId.match(/BoundaryEventSplit/)
      );
    }

    function highlightBpmnIoElement(
      canvas: any,
      task: Task,
      bpmnIoClassName: string,
      bpmnProcessIdentifiers: string[],
    ) {
      if (checkTaskCanBeHighlighted(task.bpmn_identifier)) {
        try {
          if (
            bpmnProcessIdentifiers.includes(
              task.bpmn_process_definition_identifier,
            )
          ) {
            canvas.addMarker(task.bpmn_identifier, bpmnIoClassName);
          }
        } catch (bpmnIoError: any) {
          // the task list also contains task for processes called from call activities which will
          // not exist in this diagram so just ignore them for now.
          if (
            bpmnIoError.message !==
            "Cannot read properties of undefined (reading 'id')"
          ) {
            throw bpmnIoError;
          }
        }
      }
    }

    const onImportDone = (event: any) => {
      const { error } = event;

      if (error) {
        handleError(error);
        return;
      }

      // These seem to be system tasks that cannot be highlighted
      // const taskSpecsThatCannotBeHighlighted = ['Root', 'Start', 'End'];
      //
      // function checkTaskCanBeHighlighted(taskBpmnId: string) {
      //   return (
      //     !taskSpecsThatCannotBeHighlighted.includes(taskBpmnId) &&
      //     !taskBpmnId.match(/EndJoin/) &&
      //     !taskBpmnId.match(/BoundaryEventParent/) &&
      //     !taskBpmnId.match(/BoundaryEventJoin/) &&
      //     !taskBpmnId.match(/BoundaryEventSplit/)
      //   );
      // }
      //
      // function highlightBpmnIoElement(
      //   canvas: any,
      //   task: Task,
      //   bpmnIoClassName: string,
      //   bpmnProcessIdentifiers: string[],
      // ) {
      //   if (checkTaskCanBeHighlighted(task.bpmn_identifier)) {
      //     try {
      //       if (
      //         bpmnProcessIdentifiers.includes(
      //           task.bpmn_process_definition_identifier,
      //         )
      //       ) {
      //         canvas.addMarker(task.bpmn_identifier, bpmnIoClassName);
      //       }
      //     } catch (bpmnIoError: any) {
      //       // the task list also contains task for processes called from call activities which will
      //       // not exist in this diagram so just ignore them for now.
      //       if (
      //         bpmnIoError.message !==
      //         "Cannot read properties of undefined (reading 'id')"
      //       ) {
      //         throw bpmnIoError;
      //       }
      //     }
      //   }
      // }

      let modeler = diagramModelerState;
      if (diagramType === 'dmn') {
        modeler = (diagramModelerState as any).getActiveViewer();
      }

      const canvas = (modeler as any).get('canvas');
      canvas.zoom(FitViewport, 'auto'); // Concerned this might bug out somehow.

      // highlighting a field
      // Option 3 at:
      //  https://github.com/bpmn-io/bpmn-js-examples/tree/master/colors
      if (tasks) {
        console.log('tasks', tasks.length);
        const bpmnProcessIdentifiers = getBpmnProcessIdentifiers(
          canvas.getRootElement(),
        );
        tasks.forEach((task: Task) => {
          let className = '';
          if (task.state === 'COMPLETED') {
            className = 'completed-task-highlight';
          } else if (['READY', 'WAITING', 'STARTED'].includes(task.state)) {
            className = 'active-task-highlight';
          } else if (task.state === 'CANCELLED') {
            className = 'cancelled-task-highlight';
          } else if (task.state === 'ERROR') {
            className = 'errored-task-highlight';
          }
          if (className) {
            highlightBpmnIoElement(
              canvas,
              task,
              className,
              bpmnProcessIdentifiers,
            );
          }
          if (
            task.typename === 'CallActivity' &&
            !['FUTURE', 'LIKELY', 'MAYBE'].includes(task.state)
          ) {
            addOverlayOnCallActivity(task, bpmnProcessIdentifiers);
          }
        });
      }
    };

    // console.log('diagramModelerState', diagramModelerState);
    diagramModelerState.on('import.done', onImportDone);
    diagramModelerState.importXML(diagramXMLString);
    zoom(0);
    if (diagramType !== 'dmn') {
      fixUnresolvedReferences(diagramModelerState);
    }

    return () => {
      (diagramModelerState as any).destroy();
    };
    // }, [diagramType, diagramXMLString, diagramModelerState, onImportDone, zoom]);
  }, [
    diagramType,
    diagramXMLString,
    diagramModelerState,
    zoom,
    onCallActivityOverlayClick,
    tasks,
  ]);

  // get the diagram xml
  useEffect(() => {
    if (!diagramModelerState) {
      return;
    }
    if (performingXmlUpdates) {
      return;
    }
    console.log('GET DIAGRAM');

    function dmnTextHandler(text: string) {
      const decisionId = `decision_${makeid(7)}`;
      const newText = text.replaceAll('{{DECISION_ID}}', decisionId);
      setDiagramXMLString(newText);
    }

    function bpmnTextHandler(text: string) {
      const processId = `Process_${makeid(7)}`;
      const newText = text.replaceAll('{{PROCESS_ID}}', processId);
      setDiagramXMLString(newText);
    }

    const handleError = (err: any) => {
      console.error('ERROR:', err);
    };
    function fetchDiagramFromURL(
      urlToUse: any,
      textHandler?: (text: string) => void,
    ) {
      fetch(urlToUse)
        .then((response) => response.text())
        .then(textHandler)
        .catch((err) => handleError(err));
    }

    function setDiagramXMLStringFromResponseJson(result: any) {
      setDiagramXMLString(result.file_contents);
    }

    function fetchDiagramFromJsonAPI() {
      HttpService.makeCallToBackend({
        path: `/process-models/${processModelId}/files/${fileName}`,
        successCallback: setDiagramXMLStringFromResponseJson,
      });
    }

    if (diagramXML) {
      setDiagramXMLString(diagramXML);

      return;
    }

    if (!diagramXML) {
      if (url) {
        fetchDiagramFromURL(url);
        return;
      }
      if (fileName) {
        fetchDiagramFromJsonAPI();
        return;
      }
      let newDiagramFileName = 'new_bpmn_diagram.bpmn';
      let textHandler = bpmnTextHandler;
      if (diagramType === 'dmn') {
        newDiagramFileName = 'new_dmn_diagram.dmn';
        textHandler = dmnTextHandler;
      }
      fetchDiagramFromURL(`/${newDiagramFileName}`, textHandler);
    }

    // if (diagramXML) {
    //   setDiagramXMLString(diagramXML);
    // } else if (url) {
    //   fetchDiagramFromURL(url);
    // } else if (fileName) {
    //   fetchDiagramFromJsonAPI();
    // } else {
    //   let newDiagramFileName = 'new_bpmn_diagram.bpmn';
    //   let textHandler = bpmnTextHandler;
    //   if (diagramType === 'dmn') {
    //     newDiagramFileName = 'new_dmn_diagram.dmn';
    //     textHandler = dmnTextHandler;
    //   }
    //   fetchDiagramFromURL(`/${newDiagramFileName}`, textHandler);
    // }
  }, [
    diagramModelerState,
    diagramType,
    diagramXML,
    fileName,
    // handleError,
    performingXmlUpdates,
    processModelId,
    url,
  ]);

  function handleSave() {
    if (saveDiagram) {
      (diagramModelerState as any)
        .saveXML({ format: true })
        .then((xmlObject: any) => {
          saveDiagram(xmlObject.xml);
        });
    }
  }

  function handleDelete() {
    if (onDeleteFile) {
      onDeleteFile(fileName);
    }
  }

  function handleSetPrimaryFile() {
    if (onSetPrimaryFile) {
      onSetPrimaryFile(fileName);
    }
  }

  const downloadXmlFile = () => {
    (diagramModelerState as any)
      .saveXML({ format: true })
      .then((xmlObject: any) => {
        const element = document.createElement('a');
        const file = new Blob([xmlObject.xml], {
          type: 'application/xml',
        });
        let downloadFileName = fileName;
        if (!downloadFileName) {
          downloadFileName = `${processModelId}.${diagramType}`;
        }
        element.href = URL.createObjectURL(file);
        element.download = downloadFileName;
        document.body.appendChild(element);
        element.click();
      });
  };

  const canViewXml = fileName !== undefined;

  const showReferences = () => {
    if (!callers) {
      return null;
    }
    return (
      <Modal
        open={showingReferences}
        modalHeading="Process Model References"
        onRequestClose={() => setShowingReferences(false)}
        passiveModal
      >
        <UnorderedList>
          {callers.map((ref: ProcessReference) => (
            <li key={`list-${ref.relative_location}`}>
              <Link
                size="lg"
                href={`/process-models/${modifyProcessIdentifierForPathParam(
                  ref.relative_location,
                )}`}
              >
                {`${ref.display_name}`}
              </Link>{' '}
              ({ref.relative_location})
            </li>
          ))}
        </UnorderedList>
      </Modal>
    );
  };

  const getReferencesButton = () => {
    if (callers && callers.length > 0) {
      let buttonText = `View ${callers.length} Reference`;
      if (callers.length > 1) {
        buttonText += 's';
      }
      return (
        <Button onClick={() => setShowingReferences(true)}>{buttonText}</Button>
      );
    }
    return null;
  };

  const userActionOptions = () => {
    if (diagramType !== 'readonly') {
      return (
        <ButtonSet>
          <Can
            I="PUT"
            a={targetUris.processModelFileShowPath}
            ability={ability}
          >
            <Button
              onClick={handleSave}
              disabled={disableSaveButton}
              data-qa="process-model-file-save-button"
            >
              Save
            </Button>
          </Can>
          <Can
            I="DELETE"
            a={targetUris.processModelFileShowPath}
            ability={ability}
          >
            {fileName && !isPrimaryFile && (
              <ButtonWithConfirmation
                description={`Delete file ${fileName}?`}
                onConfirmation={handleDelete}
                buttonLabel="Delete"
              />
            )}
          </Can>
          <Can I="PUT" a={targetUris.processModelShowPath} ability={ability}>
            {onSetPrimaryFile && (
              <Button onClick={handleSetPrimaryFile}>
                Set as primary file
              </Button>
            )}
          </Can>
          <Can
            I="GET"
            a={targetUris.processModelFileShowPath}
            ability={ability}
          >
            <Button onClick={downloadXmlFile}>Download</Button>
          </Can>
          <Can
            I="GET"
            a={targetUris.processModelFileShowPath}
            ability={ability}
          >
            {canViewXml && (
              <Button
                onClick={() => {
                  navigate(
                    `/process-models/${processModelId}/form/${fileName}`,
                  );
                }}
              >
                View XML
              </Button>
            )}
          </Can>
          {getReferencesButton()}
          {/* only show other users if the current user can save the current diagram */}
          <Can
            I="PUT"
            a={targetUris.processModelFileShowPath}
            ability={ability}
          >
            {activeUserElement || null}
          </Can>
        </ButtonSet>
      );
    }
    return null;
  };

  const diagramControlButtons = () => {
    // align the iconDescription to the bottom so it doesn't cover up the Save button
    // when mousing through them
    return (
      <div className="diagram-control-buttons">
        <Button
          kind="ghost"
          renderIcon={ZoomIn}
          align="bottom-left"
          iconDescription="Zoom in"
          hasIconOnly
          onClick={() => {
            zoom(1);
          }}
        />
        <Button
          kind="ghost"
          renderIcon={ZoomOut}
          align="bottom-left"
          iconDescription="Zoom out"
          hasIconOnly
          onClick={() => {
            zoom(-1);
          }}
        />
        <Button
          kind="ghost"
          renderIcon={ZoomFit}
          align="bottom-left"
          iconDescription="Zoom fit"
          hasIconOnly
          onClick={() => {
            zoom(0);
          }}
        />
      </div>
    );
  };

  return (
    <>
      {userActionOptions()}
      {showReferences()}
      {diagramControlButtons()}
    </>
  );
}
