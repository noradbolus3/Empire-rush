import React from 'react';
import { CollectionTab, CollectionTabProps } from './CollectionTab';
import { PROPERTIES_DATA } from '../data/propertiesData';
export function PropertiesTab(props: Omit<CollectionTabProps, 'data'>) { return <CollectionTab {...props} data={PROPERTIES_DATA} />; }
