import { Resource } from '../types';

export const filterResourcesBySemester = (
  resources: Resource[],
  semester: number
): Resource[] => {
  return resources.filter((resource) => resource.semester === semester);
};

export const filterResourcesByCategory = (
  resources: Resource[],
  category: string
): Resource[] => {
  return resources.filter((resource) => resource.category === category);
};

export const sortResourcesByViews = (resources: Resource[]): Resource[] => {
  return [...resources].sort((a, b) => b.views - a.views);
};

export const sortResourcesByDownloads = (resources: Resource[]): Resource[] => {
  return [...resources].sort((a, b) => b.downloads - a.downloads);
};

export const sortResourcesByDate = (resources: Resource[]): Resource[] => {
  return [...resources].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};