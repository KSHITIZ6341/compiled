import { ATOMIC_GROUP_HASH_LENGTH } from '@compiled/utils';

/**
 * Compress class names based on `classNameCompressionMap`.
 * The compressed class name has a format of `_aaaaaa_a`, which is expected by `ac`.
 * `aaaaaa` is the 6-char atomic group hash and `a` is the compressed name.
 */
export const compressClassNamesForRuntime = (
  classNames: string[],
  classNameCompressionMap?: { [index: string]: string }
): string[] => {
  // If no classNameCompressionMap, return original class names.
  if (!classNameCompressionMap) return classNames;
  return classNames.map((className) => {
    const compressedClassName =
      classNameCompressionMap && classNameCompressionMap[className.slice(1)];
    return compressedClassName
      ? `_${className.slice(1, ATOMIC_GROUP_HASH_LENGTH + 1)}_${compressedClassName}`
      : className;
  });
};
