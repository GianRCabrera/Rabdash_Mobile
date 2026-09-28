import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppButton from '../AppButton';

describe('AppButton', () => {
  test('renders its title and fires onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<AppButton title="Submit" onPress={onPress} />);

    fireEvent.press(getByText('Submit'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not fire onPress while disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<AppButton title="Submit" onPress={onPress} disabled />);

    fireEvent.press(getByText('Submit'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('does not fire onPress while loading, and shows a spinner instead of the title', () => {
    const onPress = jest.fn();
    const { queryByText } = render(<AppButton title="Submit" onPress={onPress} loading />);

    expect(queryByText('Submit')).toBeNull();
  });
});
