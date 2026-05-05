import { ClientRecord, Section } from '@/types/client';

export interface ClientTemplate {
  id: string;
  name: string;
  description: string;
  section: Section;
  data: Partial<ClientRecord>;
}

const defaultTemplates: ClientTemplate[] = [
  {
    id: 'sunlib-default',
    name: 'Client Sunlib',
    description: 'Template pour un nouveau client Sunlib',
    section: 'dp-en-cours',
    data: {
      financement: 'Sunlib',
      statut: "En cours d'instruction",
    },
  },
  {
    id: 'otovo-default',
    name: 'Client Otovo',
    description: 'Template pour un nouveau client Otovo',
    section: 'dp-en-cours',
    data: {
      financement: 'Otovo',
      statut: "En cours d'instruction",
    },
  },
  {
    id: 'upfront-default',
    name: 'Client Upfront',
    description: 'Template pour un nouveau client Upfront',
    section: 'dp-en-cours',
    data: {
      financement: 'Upfront',
      statut: "En cours d'instruction",
    },
  },
];

export function useClientTemplates() {
  const getTemplates = (section: Section): ClientTemplate[] => {
    return defaultTemplates.filter((t) => t.section === section || t.section === 'dp-en-cours');
  };

  const getTemplateById = (id: string): ClientTemplate | undefined => {
    return defaultTemplates.find((t) => t.id === id);
  };

  const applyTemplate = (
    template: ClientTemplate,
    baseData: Partial<ClientRecord>
  ): ClientRecord => {
    return {
      ...baseData,
      ...template.data,
      section: template.section,
    } as ClientRecord;
  };

  return {
    templates: defaultTemplates,
    getTemplates,
    getTemplateById,
    applyTemplate,
  };
}
