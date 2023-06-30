import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { Button, ButtonSet, Form, Stack, TextInput } from '@carbon/react';
import { isInteger, modifyProcessIdentifierForPathParam } from '../helpers';
import HttpService from '../services/HttpService';
import ProcessInstanceListTabs from '../components/ProcessInstanceListTabs';
import { ProcessInstance } from '../interfaces';
import { PRODUCT_NAME } from '../config';

export default function ProcessInstanceFindById() {
  const navigate = useNavigate();
  const [processInstanceId, setProcessInstanceId] = useState<string>('');
  const [processInstanceIdValid, setProcessInstanceIdValid] =
    useState<boolean>(true);

  useEffect(() => {
    document.title = `Process instance find - ${PRODUCT_NAME}`;
  }, []);

  const handleProcessInstanceNavigation = (result: any) => {
    const processInstance: ProcessInstance = result.process_instance;
    let path = '/admin/process-instances/';
    if (result.uri_type === 'for-me') {
      path += 'for-me/';
    }
    path += `${modifyProcessIdentifierForPathParam(
      processInstance.process_model_identifier
    )}/${processInstance.id}`;
    navigate(path);
  };

  const handleFormSubmission = (event: any) => {
    event.preventDefault();

    if (!processInstanceId) {
      setProcessInstanceIdValid(false);
    }

    if (processInstanceId && processInstanceIdValid) {
      HttpService.makeCallToBackend({
        path: `/process-instances/find-by-id/${processInstanceId}`,
        successCallback: handleProcessInstanceNavigation,
      });
    }
  };

  const handleProcessInstanceIdChange = (event: any) => {
    if (isInteger(event.target.value)) {
      setProcessInstanceIdValid(true);
    } else {
      setProcessInstanceIdValid(false);
    }
    setProcessInstanceId(event.target.value);
  };

  const formElements = () => {
    return (
      <TextInput
        id="process-instance-id-input"
        invalidText="Process Instance Id must be a number."
        invalid={!processInstanceIdValid}
        labelText="Process Instance Id*"
        value={processInstanceId}
        onChange={handleProcessInstanceIdChange}
      />
    );
  };

  const formButtons = () => {
    const buttons = [<Button type="submit">Submit</Button>];
    return <ButtonSet>{buttons}</ButtonSet>;
  };

  return (
    <>
      <ProcessInstanceListTabs variant="find-by-id" />
      <br />
      <Form onSubmit={handleFormSubmission}>
        <Stack gap={5}>
          {formElements()}
          {formButtons()}
        </Stack>
      </Form>
    </>
  );
}
