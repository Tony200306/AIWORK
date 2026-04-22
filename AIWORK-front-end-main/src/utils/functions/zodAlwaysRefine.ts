import { any, ZodType } from 'zod';

export function zodAlwaysRefine<T extends ZodType>(zodType: T) {
  return any().superRefine(async (value, ctx) => {
    const res = await zodType.safeParseAsync(value);

    if (res.success === false) {
      for (const issue of res.error.issues) {
        ctx.addIssue(issue);
      }
    }
  }) as unknown as T;
}
