import type { Schema, Struct } from '@strapi/strapi';

export interface ContactCardContacts extends Struct.ComponentSchema {
  collectionName: 'components_contact_card_contacts';
  info: {
    displayName: 'Contacts';
  };
  attributes: {
    adress: Schema.Attribute.String;
    github: Schema.Attribute.String;
    mail: Schema.Attribute.Email;
    phone: Schema.Attribute.String;
  };
}

export interface EduCardEduCard extends Struct.ComponentSchema {
  collectionName: 'components_edu_card_edu_cards';
  info: {
    displayName: 'edu_card';
  };
  attributes: {
    degree: Schema.Attribute.String;
    duration: Schema.Attribute.String;
    uni: Schema.Attribute.String;
  };
}

export interface PersonalityCardPersonalityTest extends Struct.ComponentSchema {
  collectionName: 'components_personality_card_personality_tests';
  info: {
    displayName: 'Personality Test';
  };
  attributes: {
    energy: Schema.Attribute.Integer;
    mind: Schema.Attribute.Integer;
    nature: Schema.Attribute.Integer;
    personality: Schema.Attribute.Integer;
    tactics: Schema.Attribute.Integer;
  };
}

export interface WorkCardWork extends Struct.ComponentSchema {
  collectionName: 'components_work_card_works';
  info: {
    displayName: 'Work';
  };
  attributes: {
    company_name: Schema.Attribute.String;
    duration: Schema.Attribute.String;
    job_description: Schema.Attribute.Text;
    job_location: Schema.Attribute.String;
    job_name: Schema.Attribute.String;
    schedule: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'contact-card.contacts': ContactCardContacts;
      'edu-card.edu-card': EduCardEduCard;
      'personality-card.personality-test': PersonalityCardPersonalityTest;
      'work-card.work': WorkCardWork;
    }
  }
}
