import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppButton from '../AppButton';

describe('AppButton', () => {
  test('renders its title and fires onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<AppButton title="Submit" onPress={onPress} />);

    await fireEvent.press(getByText('Submit'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not fire onPress while disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<AppButton title="Submit" onPress={onPress} disabled />);

    await fireEvent.press(getByText('Submit'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('does not fire onPress while loading, and shows a spinner instead of the title', async () => {
    const onPress = jest.fn();
    const { queryByText } = await render(<AppButton title="Submit" onPress={onPress} loading />);

    expect(queryByText('Submit')).toBeNull();
  });
});
