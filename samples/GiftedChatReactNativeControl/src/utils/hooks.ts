import React, {useEffect} from 'react';
import { Navigation } from "react-native-navigation";

export function useDidAppearListener(handler: (event: any) => void, inputs: any[]) {
    useEffect(
        () => {
            const subsNBP = Navigation.events().registerComponentDidAppearListener(
                handler
            );

            return () => {
                subsNBP.remove();
            };
        },
        inputs
    );
}

export function useNavigationButtonPressedListener(handler: (event: any) => void, inputs: any[]) {
    useEffect(
        () => {
            const subsNBP = Navigation.events().registerNavigationButtonPressedListener(
                handler
            );

            return () => {
                subsNBP.remove();
            };
        },
        inputs
    );
}