import { useEffect, useState } from 'react'
import localforage from 'localforage'

const ids = Array.from({ length: 20 }, () => crypto.randomUUID())

const Filters = ({ orderBy, onChangeOrder, onClickClearBtn }) => (
  <div className="actions">
    <select value={orderBy} onChange={onChangeOrder}>
      <option value="newest">Ordenar por mais recentes</option>
      <option value="stored">Mostrar guardados</option>
      <option value="alphabetically">Ordem alfabética</option>
    </select>
    <button onClick={onClickClearBtn}>Limpar lista</button>
  </div>
)

const FormAddItem = ({ onSubmitItem }) => {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('1')

  const handleChangeInput = (e) => setInputValue(e.target.value)
  const handleChangeSelect = (e) => setSelectValue(e.target.value)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmitItem({
      id: crypto.randomUUID(),
      quantity: +selectValue,
      name: inputValue,
      stored: false
    })
    setInputValue('')
    setSelectValue('1')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>O que você precisa guardar?</h3>

      <select value={selectValue} onChange={handleChangeSelect}>
        {ids.map((id, index) => <option key={id} value={index + 1}>{index + 1}</option>)}
      </select>

      <input value={inputValue} onChange={handleChangeInput} placeholder="Manda aqui" autoFocus />
      <button className="add-btn">Adicionar</button>
    </form>
  )
}

const ListOfItems = ({ orderBy, items, onClickCheck, onClickDelete }) => {
  const sortedItems = orderBy === "stored"
    ? items.filter((item) => item.stored)
    : orderBy === "alphabetically"
      ? items.toSorted((a, b) => a.name > b.name ? 1 : b.name > a.name ? -1 : 0)
      : items

  return (
    <ul>
      {sortedItems.map((item) => (
        <li key={item.id}>
          <input type="checkbox" checked={item.stored} onChange={() => onClickCheck(item.id)} />
          <span className={item.stored ? "line-through" : ""}>{item.quantity} {item.name}</span>
          <button onClick={() => onClickDelete(item.id)}>❌</button>
        </li>
      ))}
    </ul>
  )
}

const Logo = () => (
  <header>
    <img className="img-logo" src="logo-espaco-mulher.png" alt="Logo Espaço Mulher" />
    <h1>Espaço Mulher</h1>
  </header>
)

const Stats = ({ items }) => {
  const storedItems = items.reduce((acc, item) => item.stored ? acc + 1 : acc, 0)
  const storedPercentage = items.length === 0 ? 0 : ((storedItems / items.length) * 100).toFixed(0)
  const singularPlural = items.length === 1 ? "item" : "itens"

  return (
    <footer className="stats">
      <p>
        {`Você tem ${items.length} ${singularPlural} na lista`}
        {items.length > 0 && <span> e já guardou {storedItems} ({storedPercentage}%)</span>}
      </p>
    </footer>
  )
}

const useItems = () => {
  const [items, setItems] = useState([])
  const [orderBy, setOrderBy] = useState("newest")

  useEffect(() => {
    localforage.setItem("guardaCoisas", items)
      .catch(error => alert(error.message))
  }, [items])

  useEffect(() => {
    localforage.getItem("guardaCoisas")
      .then(value => {
        if (value) {
          setItems(value)
        }
      })
      .catch(error => alert(error.message))
  }, [])

  const handleSubmitForm = (newItem) => setItems((prev) => [...prev, newItem])
  const handleChangeOrder = (e) => setOrderBy(e.target.value)
  const handleClickDelete = (id) => setItems((prev) => prev.filter((item) => item.id !== id))
  const handleClickClearBtn = () => setItems([])

  const handleClickCheck = (id) => setItems((prev) => prev
    .map((item) => item.id === id ? { ...item, stored: !item.stored } : item))

  return {
    items,
    orderBy,
    handleSubmitForm,
    handleChangeOrder,
    handleClickDelete,
    handleClickClearBtn,
    handleClickCheck
  }
}

const App = () => {
  const state = useItems()

  return (
    <div className="store-things">
      <Logo />
      <FormAddItem onSubmitItem={state.handleSubmitForm} />
      <div className="list">
        <ListOfItems
          orderBy={state.orderBy}
          items={state.items}
          onClickCheck={state.handleClickCheck}
          onClickDelete={state.handleClickDelete}
        />
        <Filters
          orderBy={state.orderBy}
          onChangeOrder={state.handleChangeOrder}
          onClickClearBtn={state.handleClickClearBtn}
        />
      </div>
      <Stats items={state.items} />
    </div>
  )
}

export { App }
