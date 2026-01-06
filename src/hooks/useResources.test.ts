import { describe, it, expect } from 'vitest';
import { extractYouTubeId } from './useResources';

describe('extractYouTubeId', () => {
  it('should extract ID from standard YouTube URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from youtu.be URL', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract ID from embed URL', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(extractYouTubeId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should return null for invalid URL', () => {
    const url = 'https://www.google.com';
    expect(extractYouTubeId(url)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(extractYouTubeId('')).toBeNull();
  });
});
