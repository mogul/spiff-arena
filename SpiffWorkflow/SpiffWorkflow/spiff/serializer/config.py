from copy import deepcopy

from SpiffWorkflow.bpmn.serializer.workflow import DEFAULT_SPEC_CONFIG
from SpiffWorkflow.bpmn.serializer.task_spec import (
    SimpleTaskConverter,
    StartTaskConverter,
    EndJoinConverter,
    StartEventConverter,
    EndEventConverter, 
    IntermediateCatchEventConverter,
    IntermediateThrowEventConverter,
    EventBasedGatewayConverter,
    BoundaryEventConverter,
    BoundaryEventParentConverter,
    ParallelGatewayConverter,
    ExclusiveGatewayConverter,
    InclusiveGatewayConverter,
    StandardLoopTaskConverter,
)

from .task_spec import (
    NoneTaskConverter,
    ManualTaskConverter,
    UserTaskConverter,
    SendTaskConverter,
    ReceiveTaskConverter,
    ScriptTaskConverter,
    ServiceTaskConverter,
    SubprocessTaskConverter,
    TransactionSubprocessConverter,
    CallActivityTaskConverter,
    ParallelMultiInstanceTaskConverter,
    SequentialMultiInstanceTaskConverter,
    BusinessRuleTaskConverter,
)

from SpiffWorkflow.bpmn.serializer.event_definition import MessageEventDefinitionConverter as DefaultMessageEventDefinitionConverter
from .event_definition import MessageEventDefinitionConverter

SPIFF_SPEC_CONFIG = deepcopy(DEFAULT_SPEC_CONFIG)
SPIFF_SPEC_CONFIG['task_specs'] = [
    SimpleTaskConverter,
    StartTaskConverter,
    EndJoinConverter,
    StartEventConverter,
    EndEventConverter, 
    IntermediateCatchEventConverter,
    IntermediateThrowEventConverter,
    EventBasedGatewayConverter,
    BoundaryEventConverter,
    BoundaryEventParentConverter,
    ParallelGatewayConverter,
    ExclusiveGatewayConverter,
    InclusiveGatewayConverter,
    NoneTaskConverter,
    ManualTaskConverter,
    UserTaskConverter,
    SendTaskConverter,
    ReceiveTaskConverter,
    ScriptTaskConverter,
    ServiceTaskConverter,
    SubprocessTaskConverter,
    TransactionSubprocessConverter,
    CallActivityTaskConverter,
    StandardLoopTaskConverter,
    ParallelMultiInstanceTaskConverter,
    SequentialMultiInstanceTaskConverter,
    BusinessRuleTaskConverter
]
SPIFF_SPEC_CONFIG['event_definitions'].remove(DefaultMessageEventDefinitionConverter)
SPIFF_SPEC_CONFIG['event_definitions'].append(MessageEventDefinitionConverter)