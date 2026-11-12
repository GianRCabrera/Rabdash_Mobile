import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { formsFor, groupItems } from '../constants/catalog';
import { ListGroup, ListRow, MenuScreen, SectionTitle } from '../components';

// The list of forms to fill in, filtered by role (see constants/catalog.js).
// VetInputForms re-exports this.
const InputForms = () => {
  const navigation = useNavigation();
  const { state } = useAuth();

  return (
    <MenuScreen title="Input Forms" showBack>
      {groupItems(formsFor(state.user.position)).map((group, index) => (
        <React.Fragment key={group.title}>
          <SectionTitle title={group.title} first={index === 0} />
          <ListGroup>
            {group.items.map((form) => (
              <ListRow
                key={form.key}
                icon={form.icon}
                title={form.title}
                subtitle={form.subtitle}
                onPress={() => navigation.navigate(form.route, undefined, { pop: true })}
              />
            ))}
          </ListGroup>
        </React.Fragment>
      ))}
    </MenuScreen>
  );
};

export default InputForms;
