import React, {useEffect} from 'react';
import { ComponentDidAppearEvent, Navigation, NavigationButtonPressedEvent } from "react-native-navigation";

// Reference: https://github.com/wix/react-native-navigation/issues/4291

// Hook to handle when component appears on the screen
export function useDidAppearListener(handler: (event: ComponentDidAppearEvent) => void, inputs: any[]) {
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

// Hook to handle when a TopBar button is pressed
export function useNavigationButtonPressedListener(handler: (event: NavigationButtonPressedEvent) => void, inputs: any[]) {
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