'use client';

import { FC, HTMLAttributes } from 'react';

export type Props = HTMLAttributes<HTMLFormElement>;

export const Form: FC<Props> = ({ onSubmit, ...props }) => {
  return (
    <form
      {...props}
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        onSubmit?.(event);
      }}
    />
  );
};
