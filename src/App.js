import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const ALL_PEOPLE = gql`
  query AllPeople {
    people {
      id
      name
    }
  }
`;

const ADD_PERSON = gql`
  mutation AddPerson($name: String) {
    addPerson(name: $name) {
      id
      name
    }
  }
`;

const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: ID, $name: String) {
    updatePerson(id: $id, name: $name) {
      id
      name
    }
  }
`;

export default function App() {
  const [name, setName] = useState('');
  const {
    loading,
    data,
  } = useQuery(ALL_PEOPLE);

  const [addPerson] = useMutation(ADD_PERSON, {
    update: (cache, { data: { addPerson: addPersonData } }) => {
      cache.modify({
        fields: {
          people: (existingPeople) => [...existingPeople, addPersonData]
        }
      });
    },
  });

  return (
    <main>
      <h1>Apollo Client Issue Reproduction</h1>
      <p>
        This application can be used to demonstrate an error in Apollo Client.
      </p>
      <div className="add-person">
        <label htmlFor="name">Name</label>
        <input 
          type="text" 
          name="name" 
          value={name}
          onChange={evt => setName(evt.target.value)}
        />
        <button
          onClick={() => {
            addPerson({ variables: { name } });
            setName('');
          }}
        >
          Add person
        </button>
      </div>
      <h2>Names</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {data?.people.map(person => (
            <li key={person.id}>{person.name} <EditName id={person.id} name={person.name} /> </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EditName({ id, name }) {
  const [newName, setNewName] = useState(name);
  const [updatePerson] = useMutation(UPDATE_PERSON);

  useEffect(() => {
    setNewName(name);
  }, [name]);

  return (
    <>
      <input value={newName} onChange={(evt) => setNewName(evt.target.value)} />
      <button
        onClick={() => updatePerson({ variables: { id, name: newName }})}
      >
        Save
      </button>
    </>
  );
}
