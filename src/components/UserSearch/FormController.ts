import * as Yup from 'yup';
import { useForm } from 'react-hook-form';

import { useYupValidationResolver } from 'hooks/useYupValidationResolver';

type FormValues = {
  query: string;
};

const defaultValues = {
  query: '',
};

const validationSchema = Yup.object().shape({
  query: Yup.string().trim().required('Please input user name to search'),
});

const useSearchboxFormController = () => {
  const resolver = useYupValidationResolver(validationSchema);

  const form = useForm<FormValues>({ resolver, defaultValues, shouldFocusError: false, mode: 'onChange' });

  return form;
};

export default useSearchboxFormController;
