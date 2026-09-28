import React from 'react';
import { CollectionTab, CollectionTabProps } from './CollectionTab';
import { CARS_DATA } from '../data/carsData';
export function CarsTab(props: Omit<CollectionTabProps, 'data'>) { return <CollectionTab {...props} data={CARS_DATA} />; }
