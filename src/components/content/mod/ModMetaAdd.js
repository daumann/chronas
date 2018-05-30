import React from 'react'
import {
  translate,
  BooleanField,
  Create,
  Datagrid,
  DateField,
  DateInput,
  DisabledInput,
  SingleFieldList,
  ChipField,
  EmailField,
  Filter,
  FormTab,
  Edit,
  Delete, SimpleForm,
  UrlField,
  NullableBooleanInput,
  NumberField,
  NumberInput,
  ReferenceManyField,
  ReferenceArrayField,
  TabbedForm,
  TextField,
  TextInput,
  LongTextInput,
  SelectInput,
  required,
  minLength
} from 'admin-on-rest'
import { EmbeddedArrayInput } from 'aor-embedded-array'
import { Link } from 'react-router-dom'
import { List, ListItem } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Subheader from 'material-ui/Subheader'
import AutocompleteInput from '../../restricted/shared/inputs/AutocompleteInput'
import MetaForm from '../../restricted/shared/forms/MetaForm'
import ModButton from '../../restricted/shared/buttons/ModButton'
import utils from '../../map/utils/general'
import ColorInput from 'aor-color-input'
import AutocompleteDisallowInput from '../../restricted/shared/inputs/AutocompleteDisallowInput'

export const ModMetaAdd = (props) => {
  const { metadata } = props
  const selectedProvince = (props.selectedItem || {}).province || ''
  const activeArea = props.activeArea || { data: {} }
  // const activeAreaDim = props.activeArea.color
  // const activeprovinceDim = (props.activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor(activeAreaDim)]
  // const selectedWiki = (metadata[activeAreaDim][activeprovinceDim] || {})[2]

  // const defaultValues = {
  //   'provinces': selectedProvince || '',
  //   'dataRuler': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('ruler')] || '',
  //   'dataCulture': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('culture')] || '',
  //   'dataReligion': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('religion')] || '',
  //   'dataCapital': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('capital')] || '',
  //   'dataPopulation': (activeArea.data[selectedProvince] || {})[utils.activeAreaDataAccessor('population')] || 1000,
  //   'yearStart': props.selectedYear || 1000,
  //   'yearEnd': props.selectedYear || 1000,
  //   'dataIcon': ''
  // }

  const choicesRuler = Object.keys(metadata['ruler']).map((rulerId) => {
    return { id: rulerId, name: metadata['ruler'][rulerId][0] }
  }) || {}

  const choicesReligion = Object.keys(metadata['religion']).map((religionId) => {
    return { id: religionId, name: metadata['religion'][religionId][0] }
  }) || {}

  const choicesReligionGeneral = Object.keys(metadata['religionGeneral']).map((religionId) => {
    return { id: religionId, name: metadata['religionGeneral'][religionId][0] }
  }) || {}

  const choicesCulture = Object.keys(metadata['culture']).map((cultureId) => {
    return { id: cultureId, name: metadata['culture'][cultureId][0] }
  }) || {}

  const choicesCapital = Object.keys(metadata['capital']).map((capitalId) => {
    return { id: capitalId, name: metadata['capital'][capitalId][0] }
  }) || {}

  const choicesProvince = Object.keys(metadata['province']).map((capitalId) => {
    return { id: capitalId, name: metadata['province'][capitalId][0] }
  }) || {}

  const contentType = [
    { type: 'markers', name: '[Marker] Artifacts', id: 'm_artifacts' },
    { type: 'markers', name: '[Marker] Battles -> Battles', id: 'm_battles' },
    { type: 'markers', name: '[Marker] Battles -> Sieges', id: 'm_sieges' },
    { type: 'markers', name: '[Marker] Cities -> Cities', id: 'm_cities' },
    { type: 'markers', name: '[Marker] Cities -> Castles', id: 'm_castles' },
    { type: 'markers', name: '[Marker] People -> Military', id: 'm_military' },
    { type: 'markers', name: '[Marker] People -> Politicians', id: 'politicians' },
    { type: 'markers', name: '[Marker] People -> Explorers', id: 'm_explorers' },
    { type: 'markers', name: '[Marker] People -> Scientists', id: 'm_scientists' },
    { type: 'markers', name: '[Marker] People -> Artists', id: 'm_artists' },
    { type: 'markers', name: '[Marker] People -> Religious', id: 'm_religious' },
    { type: 'markers', name: '[Marker] People -> Athletes', id: 'm_athletes' },
    { type: 'markers', name: '[Marker] People -> Unclassified', id: 'm_unclassified' },
    { type: 'markers', name: '[Marker] Other -> Area Info', id: 'm_areainfo' },
    { type: 'markers', name: '[Marker] Other -> Unknown', id: 'm_unknown' },
    { type: 'metadata', id: 'meta_story', name: 'Story' },
    { type: 'metadata', id: 'meta_image', name: 'Image' },
    { type: 'metadata', id: 'meta_audio', name: 'Audio' },
    { type: 'metadata', id: 'meta_text', name: 'External Article or Primary Source' },
    { type: 'metadata', id: 'meta_video', name: 'Video' },
    { type: 'metadata', id: 'meta_other', name: 'Other' }
  ]

  const choicesEpicSubtypes = [
    { id: 'war', name: 'War' },
    { id: 'battle', name: 'Battle' },
    { id: 'siege', name: 'Siege' },
    { id: 'campaign', name: 'Campaign'}
  ]

  const choicesType = [
    { id: 'ruler', name: 'Ruler' },
    { id: 'culture', name: 'Culture' },
    { id: 'religion', name: 'Religion' },
    { id: 'religionGeneral', name: 'Religion (General)' },
    { id: 'capital', name: 'Capital' },
    { id: 'province', name: 'Province' },
    { id: 'e', name: 'Epic' },
  ]

  const validateValueInput = (values) => {
    const errors = {}

    if (values.url && values.url.indexOf('.wikipedia.org/wiki/') === -1) {
      errors.url = ['The URL needs to be a full Wikipedia URL']
    }
    if (values.name === '') {
      errors.name = ['This name already exists. If you like to edit an existing resource click Edit Entity on top.']
    }
    if (!values.color) {
      errors.color = ['Color value is required']
    }

    if (values.icon &&
      (values.icon.indexOf('.wikipedia.org/') === -1 && values.icon.indexOf('.wikimedia.org/') === -1)) {
      errors.icon = ["The icon URL needs to be a full wikipedia or wikimedia URL, for example: 'https://en.wikipedia.org/wiki/Battle_of_Vienna#/media/File:Chor%C4%85giew_kr%C3%B3lewska_kr%C3%B3la_Zygmunta_III_Wazy.svg'"]
    }

    console.debug('errors', errors)

    return errors
  }

  const typeInputs = {
    'e':
      <MetaForm validate={validateValueInput} {...props} redirect='create'>
        <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
        <TextInput validate={required} type='url' source='url' label='resources.areas.fields.wiki_url' />
        <AutocompleteInput validate={required} type='text' choices={choicesEpicSubtypes} source='subtype' label='resources.areas.fields.subtype' />
        <TextInput validate={required} type='number' source='start' label='resources.areas.fields.start' />
        <TextInput type='number' source='end' label='resources.areas.fields.end' />
        <EmbeddedArrayInput source='participants'>
          <EmbeddedArrayInput source='participantTeam'>
            <AutocompleteInput source='name' choices={choicesRuler} label='resources.areas.fields.participant' />
          </EmbeddedArrayInput>
        </EmbeddedArrayInput>
        <EmbeddedArrayInput validate={required} source="content" label='Content (shows up in left content column, if it doesnt exist yet, you can create _media/ others_ and _markers_ to be added here)'>
          <SelectInput validate={required} source='contentType' choices={contentType} onChange={(val, v) => { props.setContentType(v) }} defaultValue={props.contentType} />
          <AutocompleteInput validate={required} source='name' choices={props.contentChoice} label='resources.areas.fields.participant' onSearchChange={(val) => { console.debug(val); return props.setSearchSnippet(val) }} />
        </EmbeddedArrayInput>
        <TextInput type='text' source='title' label='resources.areas.fields.title' />
        <ModButton modType='marker' />
        <NumberInput onChange={(val, v) => { props.setModDataLng(+v) }} source='coo[0]' label='resources.markers.fields.lat' />
        <NumberInput onChange={(val, v) => { props.setModDataLat(+v) }} source='coo[1]' label='resources.markers.fields.lng' />
        <TextInput type='text' source='partOf' label='resources.areas.fields.partOf' />
      </MetaForm>,
    'ruler':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput source='name' choices={choicesRuler} label='resources.areas.fields.display_name' />
    <ColorInput validate={required} source='color' label='resources.areas.fields.color' picker='Compact' />
    <TextInput validate={required} type='url' source='url' label='resources.areas.fields.wiki_url' />
    <TextInput validate={required} type='text' source='icon' label='resources.areas.fields.text' />
  </MetaForm>,
    'religion':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput validate={required} source='name' choices={choicesReligion} label='resources.areas.fields.display_name' />
    <AutocompleteInput validate={required} source='parentname' choices={choicesReligionGeneral} label='resources.areas.fields.main_religion_name' />
    <ColorInput validate={required} source='color' label='resources.areas.fields.color' picker='Compact' />
    <TextInput validate={required} type='url' source='url' label='resources.areas.fields.wiki_url' />
    <TextInput validate={required} type='url' source='icon' label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'religionGeneral':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput validate={required} source='name' choices={choicesReligionGeneral} label='resources.areas.fields.display_name' />
    <ColorInput validate={required} source='color' label='resources.areas.fields.color' picker='Compact' />
    <TextInput validate={required} type='url' source='url' label='resources.areas.fields.wiki_url' />
    <TextInput validate={required} type='url' source='icon' label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'culture':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput validate={required} source='name' choices={choicesCulture} label='resources.areas.fields.display_name' />
    <ColorInput validate={required} source='color' label='resources.areas.fields.color' picker='Compact' />
    <TextInput validate={required} type='url' source='url' label='resources.areas.fields.wiki_url' />
    <TextInput validate={required} type='url' source='icon' label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'capital':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput validate={required} source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
    <AutocompleteDisallowInput validate={required} source='name' choices={choicesCapital} label='resources.areas.fields.display_name' />
    <TextInput validate={required} type='url' source='url' label='resources.areas.fields.wiki_url' />
    <TextInput validate={required} type='url' source='icon' label='resources.areas.fields.icon_url' />
  </MetaForm>,
    'default':
  <MetaForm validate={validateValueInput} {...props} >
    <SelectInput source='type' choices={choicesType} onChange={(val, v) => { props.setMetadataType(v) }} defaultValue={props.metadataType} />
    <span>select type of metadata from above dropdown</span>
  </MetaForm>
  }

  return <Create {...props}>
    {typeInputs[props.metadataType] || typeInputs['default']}
  </Create>
}
