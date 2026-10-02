import React from 'react';
import { CollectionTab, CollectionTabProps } from './CollectionTab';
import { JETS_DATA } from '../data/jetsData';
export function JetsTab(props: Omit<CollectionTabProps, 'data'>) { return <CollectionTab {...props} data={JETS_DATA} />; }
