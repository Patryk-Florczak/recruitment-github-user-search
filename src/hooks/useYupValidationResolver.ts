/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { Schema } from 'yup';

export const useYupValidationResolver = (validationSchema: Schema) =>
  useCallback(
    async (data: unknown) => {
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        });

        return {
          values,
          errors: {},
        };
      } catch (errors: any) {
        return {
          values: {},
          errors: errors.inner.reduce(
            (allErrors: any, currentError: any) => ({
              ...allErrors,
              [currentError.path]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            }),
            {},
          ),
        };
      }
    },
    [validationSchema],
  );
