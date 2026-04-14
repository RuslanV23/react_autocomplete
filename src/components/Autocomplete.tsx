import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Person } from '../types/Person';

type Props = {
  people: Person[];
  delay: number;
  onSelected: (person: Person | null) => void;
};

function debounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number,
) {
  let timerId = 0;

  return (...args: Parameters<T>) => {
    clearTimeout(timerId);

    timerId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export const Autocomplete: React.FC<Props> = ({
  people,
  delay,
  onSelected,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [appliedQuery, setAppliedQuery] = useState('');

  const applyQuery = useMemo(
    () => debounce(setAppliedQuery, delay),
    [setAppliedQuery, delay],
  );

  const handleQueryChange = (event: React.FocusEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    applyQuery(event.target.value);
    onSelected(null);
  };

  const filterPeople = useMemo(() => {
    return people.filter(person => {
      return person.name
        .trim()
        .toLocaleLowerCase()
        .includes(appliedQuery.toLocaleLowerCase());
    });
  }, [appliedQuery, people]);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpenMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="dropdown is-active">
        <div className="dropdown-trigger">
          <input
            type="text"
            placeholder="Enter a part of the name"
            className="input"
            value={inputValue}
            onFocus={() => setIsOpenMenu(true)}
            ref={inputRef}
            data-cy="search-input"
            onChange={handleQueryChange}
          />
        </div>
        {isOpenMenu && (
          <div
            ref={menuRef}
            className="dropdown-menu"
            role="menu"
            data-cy="suggestions-list"
          >
            {filterPeople.length !== 0 && (
              <div className="dropdown-content">
                {filterPeople.map(person => {
                  return (
                    <div
                      className="dropdown-item is-clickable"
                      data-cy="suggestion-item"
                      key={person.slug}
                      onClick={() => {
                        onSelected(person);
                        setInputValue(person.name);
                        setIsOpenMenu(false);
                      }}
                    >
                      <p className="has-text-link">{person.name}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {filterPeople.length === 0 && (
        <div
          className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
          role="alert"
          data-cy="no-suggestions-message"
        >
          <p className="has-text-danger">No matching suggestions</p>
        </div>
      )}
    </>
  );
};
