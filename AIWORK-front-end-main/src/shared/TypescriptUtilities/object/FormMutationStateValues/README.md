# Overview

The `FormMutationStateValues` type utility is designed to handle the dynamic nature of form values, particularly when using libraries like Zod for schema validation. It provides a type transformation that ensures compatibility between the schema-defined structure of data and the mutable state of the form during user interaction.

# Concept

**Zod Schema**: Defines the structure and validation rules for form data, ensuring that it conforms to expected types and formats. However, during form interaction, some values might be `undefined` or `null` before the form is fully submitted.

**Interactive Form Values**: Represents the actual state of the form as it is being interacted with by the user. This state can include `undefined` or `null` values, reflecting the dynamic nature of user input and intermediate states.

**Challenge**: When working with forms, especially in combination with libraries like Zod, the initial form values might be empty or partial. For instance, if a default value is an empty object `{}`, certain fields might be `undefined` during form interaction. Without a type utility that accommodates these intermediate states, form handling can become error-prone.

The `FormMutationStateValues` type utility transforms a given type, derived from a Zod schema, into a format where all properties, including nested properties, can be optionally `undefined` or `null`. This allows for more flexible form state management, aligning with the real-time state of the form.

### Example

Consider the following Zod schema for a form:

```typescript
interface FormSchema {
  file: File;
  sectionName: string;
  student: {
    name: string;
  };
  questions: Array<{
    key: string;
    questionId: string;
    totalTimes: number;
    totalPoints: number;
  }>;
}
```

For instance, if you pass an empty object `{}` as the default values to a form mutation handler and the `file` field is used to upload final scores, the `questions` field might initially be `undefined` during user interaction. Without `FormMutationStateValues`, the `questions` field would be expected to always have a value, potentially leading to issues if it is not yet available.

Applying `FormMutationStateValues` ensures that the type transformation allows `questions` to be `undefined` or `null`, accurately reflecting the form's interactive state. This means that the form state will properly accommodate intermediate values and handle cases where fields are not yet populated.

By using `FormMutationStateValues`, you can:

- Avoid type errors when fields are not immediately available.
- Make your form handling code more robust and adaptable to various user inputs.
- Ensure that all properties, including nested ones, are treated consistently as optional or nullable, thus aligning with the real-time form state.

# Usage

To use the `FormMutationStateValues` type utility, provide it with a type. The utility will return a new type where every property, including those in nested objects or arrays, can also be `undefined` or `null`.

```typescript
type ResultType = FormMutationStateValues<OriginalType>;
```

# Examples

```typescript
interface SimpleFormSchema {
  file: File;
  sectionName: string;
  student: {
    name: string;
  };
  someIds: string[];
  questions: Array<{
    key: string;
    questionId: string;
    totalTimes: number;
    totalPoints: number;
    someIdsButInNested: string[];
  }>;
}

type SimpleFormStateValues = FormMutationStateValues<SimpleFormSchema, ["key"]>;
// Result type:
// type SimpleFormStateValues = {
//   file: File | undefined;
//   sectionName: string | undefined;
//   student: {
//       name: string | undefined;
//   } | undefined;
//   someIds: string[] | undefined;
//   questions: {
//       key: string;
//       questionId: string | undefined;
//       totalTimes: number | undefined;
//       totalPoints: number | undefined;
//       someIdsButInNested: string[] | undefined;
//   }[] | undefined;
// }
```
