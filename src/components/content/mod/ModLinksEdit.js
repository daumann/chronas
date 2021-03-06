import React from 'react'
import {
  BooleanField,
  ChipField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Delete,
  DisabledInput,
  Edit,
  EmailField,
  Filter,
  FormTab,
  LongTextInput,
  minLength,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceArrayField,
  ReferenceManyField,
  required,
  SaveButton,
  SelectInput,
  SimpleForm,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
  Toolbar,
  translate,
  UrlField
} from 'admin-on-rest'
import Divider from 'material-ui/Divider'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import AddEditLinkNavigation from '../../restricted/shared/AddEditLinkNavigation'
import SelectArrayInput from '../../restricted/shared/inputs/SelectArrayInput'
import LinksForm from '../../restricted/shared/forms/LinksForm'

const CustomToolbar = props => <Toolbar {...props}>
  <SaveButton
    label='Done'
    submitOnEnter
    handleSubmitWithRedirect={(redirect = this.props.redirect, value) => {
      this.props.history.goBack()
    }} />
</Toolbar>

export const ModLinksEdit = (props) => {
  return <div>
    <AddEditLinkNavigation pathname={props.location.pathname} />
    <Divider />
    <Create title={'Link Articles and Media'} {...props}>
      <LinksForm {...props} toolbar={<CustomToolbar />} redirect='create' defaultValue={props.linkedItemData}>
        <AutocompleteInput setLinkedItemData={props.setLinkedItemData}
          elStyle={{ width: '100%' }}
          validate={required}
          source='linkedItemKey1'
          choices={props.linkedItemData.linkedItemKey1choice}
          label='resources.links.fields.source'
          onSearchChange={(val) => {
            return props.setSearchSnippet(val, props.linkedItemData.linkedItemType1, 'linkedItemKey1choice')
          }}
          onChange={(val) => {
            return props.ensureLoadLinkedItem(props.linkedItemData.linkedItemKey1)
          }}
        />
        <h3>Link to media section</h3>
        <b>Only media entities (images, videos, audio etc) allowed</b>
        <SelectArrayInput
          setLinkedItemData={props.setLinkedItemData}
          linkedItemData={props.linkedItemData}
          choices={props.linkedItemData.linkedItemKey2choice}
          onSearchChange={(val) => {
            return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, 'linkedItemKey2choice', false)
          }}
          onChange={(val) => {
            return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2)
          }} validation={required} elStyle={{ width: '60%', minWidth: '300px' }}

          source='linkedMedia' label='resources.links.fields.media_list' />
        <Divider />
        <h3>Link to content section</h3>
        <b>Only wiki article entities, epics or area entities allowed</b>
        <SelectArrayInput
          setLinkedItemData={props.setLinkedItemData}
          linkedItemData={props.linkedItemData}
          choices={props.linkedItemData.linkedItemKey2choice}
          onSearchChange={(val) => {
            return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2, 'linkedItemKey2choice')
          }}
          onChange={(val) => {
            return props.setSearchSnippet(val, props.linkedItemData.linkedItemType2)
          }} validation={required} elStyle={{ width: '60%', minWidth: '300px' }} source='linkedContent'
          label='resources.links.fields.content_list' />
      </LinksForm>
    </Create></div>
}
