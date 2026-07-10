/**
 * Importing npm packages
 */
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type IconName = ComponentProps<typeof Feather>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
};

/**
 * Declaring the constants
 */

// Thin wrapper over Feather so the line-icon set the design uses is imported from one place.
export function Icon({ name, size = 20, color }: IconProps) {
  return <Feather name={name} size={size} color={color} />;
}
