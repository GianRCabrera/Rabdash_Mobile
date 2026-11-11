import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { formsFor, groupItems } from '../constants/catalog';
import { ListGroup, ListRow, MenuScreen, SectionTitle } from '../components';

// The list of form archives, filtered by role (see constants/catalog.js).
// VetArchiveMenu re-exports this.
const ClientDatabase = () => {
  const navigation = useNavigation();
  const { state } = useAuth();

  return (
    <MenuScreen title="Form Archives" showBack>
      {groupItems(formsFor(state.user.position)).map((group, index) => (
        <React.Fragment key={group.title}>
          <SectionTitle title={group.title} first={index === 0} />
          <ListGroup>
            {group.items.map((form) => (
              <ListRow
                key={form.key}
                icon={form.icon}
                title={form.title}
                subtitle="View, edit or delete submissions"
                onPress={() => navigation.navigate(form.archiveRoute, undefined, { pop: true })}
              />
            ))}
          </ListGroup>
        </React.Fragment>
      ))}
    </MenuScreen>
  );
};

export default ClientDatabase;
